// src/shared/logging/logger.shared.ts
import { getRuntimeNodeEnv } from "@/shared/config/env-public";
import type { LogLevel } from "@/shared/config/env-schemas";
import { getProcessId } from "@/shared/config/env-utils";
import {
  BaseError,
  type BaseErrorLogPayload,
  type ErrorContext,
  isBaseError,
  type SerializedErrorCause,
} from "@/shared/errors/base-error";
import {
  ERROR_CODES,
  type ErrorCode,
  type Severity,
} from "@/shared/errors/error-codes";
import { createRedactor } from "@/shared/errors/redaction/redaction";
import {
  consoleMethod,
  currentPriority,
  levelPriority,
} from "@/shared/logging/logger.levels";
import type {
  DetailedErrorPayload,
  LogBaseErrorOptions,
  LogEntry,
  OperationData,
  SafeErrorShape,
} from "@/shared/logging/logger.types";

const processId = getProcessId();

/**
 * Shared redactor for log payloads, built on the core redaction system.
 *
 * - Uses DEFAULT_SENSITIVE_KEYS and redaction configuration.
 * - Guards against circular references per invocation.
 */
const redactLogData = createRedactor();

/**
 * Map domain \`Severity\` to \`LogLevel\` with an exhaustive check.
 */
function severityToLogLevel(severity: Severity): LogLevel {
  switch (severity) {
    case "warn":
      return "warn";
    case "info":
      return "info";
    case "error":
      return "error";
    default: {
      const _exhaustive: never = severity;
      return _exhaustive;
    }
  }
}

/**
 * Normalize any `unknown` error into a safe, structured shape for logging.
 *
 * @remarks
 * - Uses the same structure as `SerializedErrorCause`
 * - Avoids leaking arbitrary properties from the error object
 */
export function toSafeErrorShape(err: unknown): SafeErrorShape {
  if (err instanceof Error) {
    return {
      message: err.message,
      name: err.name,
      ...(err.stack && { stack: err.stack }),
    };
  }
  return String(err);
}

/**
 * Sensitivity-aware structured logger.
 */
export class Logger {
  private readonly context?: string;
  private readonly requestId?: string;

  constructor(context?: string, requestId?: string) {
    this.context = context;
    this.requestId = requestId;
  }

  // --------------------------------------------------------------------------
  // Public Logging Methods
  // --------------------------------------------------------------------------

  trace<T>(message: string, data?: T): void {
    this.logAt("trace", message, data);
  }

  debug<T>(message: string, data?: T): void {
    this.logAt("debug", message, data);
  }

  info<T>(message: string, data?: T): void {
    this.logAt("info", message, data);
  }

  warn<T>(message: string, data?: T): void {
    this.logAt("warn", message, data);
  }

  error<T>(message: string, data?: T): void {
    this.logAt("error", message, data);
  }

  // --------------------------------------------------------------------------
  // Logger Factory Methods
  // --------------------------------------------------------------------------

  /**
   * Create a child logger with additional context.
   */
  withContext(context: string): Logger {
    const combined = this.context ? `${this.context}:${context}` : context;
    return new Logger(combined, this.requestId);
  }

  /**
   * Attach a request ID for correlation (useful in SSR or API contexts).
   */
  withRequest(requestId: string): Logger {
    return new Logger(this.context, requestId);
  }

  // Core
  private shouldLog(level: LogLevel): boolean {
    return levelPriority[level] <= currentPriority();
  }

  private createEntry<T>(
    level: LogLevel,
    message: string,
    data?: T,
  ): LogEntry<T> {
    const entry: LogEntry<T> = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };
    if (this.context !== undefined && this.context !== "") {
      entry.context = this.context;
    }
    if (this.requestId !== undefined && this.requestId !== "") {
      entry.requestId = this.requestId;
    }
    if (processId !== undefined) {
      entry.pid = processId;
    }
    if (data !== undefined) {
      // Use shared redaction system for all log data
      entry.data = redactLogData(data) as T;
    }
    return entry;
  }

  private format(entry: LogEntry): unknown[] {
    if (getRuntimeNodeEnv() === "production") {
      return [JSON.stringify(entry)];
    }
    const prefix: string[] = [entry.timestamp];
    if (entry.requestId) {
      prefix.push(`[req:${entry.requestId}]`);
    }
    if (entry.context) {
      prefix.push(`[${entry.context}]`);
    }
    const head = prefix.join(" ");
    return entry.data !== undefined
      ? [head, entry.message, entry.data]
      : [head, entry.message];
  }

  private output(entry: LogEntry): void {
    consoleMethod[entry.level](...this.format(entry));
  }

  private logAt<T>(level: LogLevel, message: string, data?: T): void {
    if (!this.shouldLog(level)) {
      return;
    }
    const entry = this.createEntry(level, message, data);
    this.output(entry);
  }

  // Operation logging
  operation<T extends Record<string, unknown>>(
    level: LogLevel,
    message: string,
    data: OperationData<T>,
  ): void {
    const { operation, context, identifiers, ...rest } = data;
    const logData = {
      operation,
      ...(identifiers ?? {}),
      ...rest,
    };
    const target = context ? this.withContext(context) : this;
    target.logAt(level, message, logData);
  }

  /**
   * Log a BaseError with structured, sanitized output.
   *
   * @remarks
   * - By default, uses `toJson()` which excludes stack/cause for safety
   * - Set `detailed: true` to include stack traces and cause chain
   * - Automatically extracts `diagnosticId` from error context when present
   * - Maps error severity to appropriate log level
   * - All payloads are immutably constructed
   *
   * @example
   * ```typescript
   * logger.logBaseError(error);
   * logger.logBaseError(error, { detailed: true, extra: { userId: '123' } });
   * ```
   */
  logBaseError(error: BaseError, options: LogBaseErrorOptions = {}): void {
    const {
      message = error.message,
      extra,
      detailed = false,
      levelOverride,
    } = options;

    const level = levelOverride ?? severityToLogLevel(error.severity);

    // Build payload immutably
    const payload = this.buildErrorPayload(error, {
      detailed,
      extra,
    });

    this.logAt(level, message, payload);
  }

  /**
   * Build an immutable error payload for logging.
   *
   * @internal
   */
  private buildErrorPayload(
    error: BaseError,
    options: { detailed: boolean; extra?: Record<string, unknown> },
  ): DetailedErrorPayload {
    const { detailed, extra } = options;

    // Start with base sanitized shape (no stack/cause)
    const baseJson = error.toJson();

    // Extract diagnosticId with type safety
    const diagnosticId = this.extractDiagnosticId(error.context);

    // Build base payload immutably
    const basePayload: BaseErrorLogPayload & Record<string, unknown> = {
      ...baseJson,
      ...(diagnosticId && { diagnosticId }),
      ...(extra && { ...extra }),
    };

    // Add detailed information if requested
    if (!detailed) {
      return basePayload;
    }

    // Build detailed payload immutably
    const detailedPayload: DetailedErrorPayload = {
      ...basePayload,
      ...(error.stack && { stack: error.stack }),
      ...(error.cause instanceof Error && {
        cause: this.serializeErrorCause(error.cause),
      }),
    };

    return detailedPayload;
  }

  /**
   * Safely extract diagnosticId from error context.
   *
   * @internal
   */
  private extractDiagnosticId(
    context: ErrorContext | undefined,
  ): string | undefined {
    if (!context) {
      return;
    }

    const ctx = context as Record<string, unknown>;
    const id = ctx.diagnosticId;

    // Type-safe extraction: only return if it's actually a string
    return typeof id === "string" ? id : undefined;
  }

  /**
   * Serialize an Error cause into a safe, JSON-compatible structure.
   *
   * @internal
   */
  private serializeErrorCause(cause: Error): SerializedErrorCause {
    return {
      message: cause.message,
      name: cause.name,
      ...(cause.stack && { stack: cause.stack }),
    };
  }

  errorWithDetails(
    message: string,
    error: unknown,
    extra?: Record<string, unknown>,
  ): void {
    if (!isBaseError(error)) {
      this.error(message, {
        error: toSafeErrorShape(error),
        ...extra,
      });
      return;
    }
    this.logBaseError(error, {
      detailed: true,
      extra,
      levelOverride: "error",
      message,
    });
  }

  // Convenience wrapper (safe log) for unknown values
  normalizeAndLog(
    err: unknown,
    fallbackMessage = "Operation failed",
    fallbackCode = ERROR_CODES.unknown.name satisfies ErrorCode,
    extra?: Record<string, unknown>,
  ): BaseError {
    const baseErr = BaseError.from(err, fallbackCode, extra);
    this.logBaseError(baseErr, { message: fallbackMessage });
    return baseErr;
  }
}

// Default instance
export const logger = new Logger();
