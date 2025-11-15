// src/shared/logging/logger.shared.ts
import {
  getPublicLogLevel,
  getRuntimeNodeEnv,
} from "@/shared/config/env-public";
import type { LogLevel } from "@/shared/config/env-schemas";
import { getProcessId } from "@/shared/config/env-utils";
import {
  BaseError,
  type BaseErrorLogPayload,
  type ErrorContext,
  isBaseError,
} from "@/shared/core/errors/base-error";
import {
  ERROR_CODES,
  type ErrorCode,
  type Severity,
} from "@/shared/core/errors/error-codes";
import { createRedactor } from "@/shared/core/errors/redaction/redaction";

// ============================================================================
// Level priority (exposure risk ordering)
// ============================================================================

/**
 * Priority by **risk of exposing sensitive information**.
 *
 * Higher number = greater exposure risk.
 *
 * @property trace - Highest risk (contains most detailed internal data)
 * @property debug - High risk (technical details, stack traces)
 * @property info  - Moderate risk (operational events)
 * @property warn  - Low risk (recoverable issues)
 * @property error - Lowest risk (usually safe to expose)
 */
const levelPriority = {
  debug: 40,
  error: 10,
  info: 30,
  trace: 50,
  warn: 20,
} as const satisfies Record<LogLevel, number>;

/**
 * Cached console methods for minimal overhead.
 */
const consoleMethod: Record<LogLevel, (...args: unknown[]) => void> = {
  debug: console.debug.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  trace: console.trace.bind(console),
  warn: console.warn.bind(console),
} as const;

const processId = getProcessId();

// ============================================================================
// Sanitization (shared redaction system)
// ============================================================================

/**
 * Shared redactor for log payloads, built on the core redaction system.
 *
 * - Uses DEFAULT_SENSITIVE_KEYS and redaction configuration.
 * - Guards against circular references per invocation.
 */
const redactLogData = createRedactor();

// ============================================================================
// Runtime helpers
// ============================================================================

let cachedLogLevel: LogLevel | null = null;
let cachedPriority: number | null = null;

/**
 * Derive the effective public log level at runtime.
 * Falls back to \`info\` if the public env var is missing/invalid.
 */
function getEffectiveLogLevel(): LogLevel {
  if (cachedLogLevel !== null) {
    return cachedLogLevel;
  }
  try {
    cachedLogLevel = getPublicLogLevel();
  } catch {
    console.error("getEffectiveLogLevel failed, defaulting to 'info'");
    cachedLogLevel = "info";
  }
  cachedPriority = levelPriority[cachedLogLevel];
  return cachedLogLevel;
}

/**
 * Get the current log level priority with safe fallback.
 *
 * @returns The cached priority, or defaults to 'info' priority if uninitialized.
 */
function currentPriority(): number {
  if (cachedPriority === null) {
    getEffectiveLogLevel();
  }
  // Defensive fallback: should never happen after getEffectiveLogLevel, but ensures type safety
  return cachedPriority ?? levelPriority.info;
}

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

// ============================================================================
// Types
// ============================================================================

/**
 * Structured log entry format for consistency and JSON parsing.
 */
export interface LogEntry<T = unknown> {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: string;
  data?: T;
  pid?: number;
  requestId?: string;
}

/**
 * Operation metadata for DAL/repository pattern logging.
 */
export interface OperationMetadata {
  /** The operation name (e.g., 'getUserByEmail') */
  operation: string;
  /** Optional context override (e.g., 'dal.users') */
  context?: string;
  /** Key identifiers for the operation (e.g., { userId: '123' }) */
  identifiers?: Record<string, unknown>;
}

/**
 * Combined data structure for operation logging.
 */
export type OperationData<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T & OperationMetadata;

/**
 * Options for logging BaseError instances.
 */
export interface LogBaseErrorOptions {
  /** Override message (defaults to error.message) */
  message?: string;
  /** Extra structured fields to merge */
  extra?: Record<string, unknown>;
  /** Include stack + cause chain (defaults false) */
  detailed?: boolean;
  /** Force log level override */
  levelOverride?: LogLevel;
}

/**
 * Enriched error payload for detailed BaseError logging.
 *
 * Extends the base payload with optional diagnostic fields
 * that are only included when `detailed: true`.
 */
export interface DetailedErrorPayload extends BaseErrorLogPayload {
  /** Stack trace (only in detailed mode) */
  readonly stack?: string;
  /** Serialized cause chain (only in detailed mode) */
  readonly cause?: SerializedErrorCause;
}

/**
 * Serialized representation of an Error cause.
 *
 * Provides a safe, JSON-compatible structure for error causes.
 */
export interface SerializedErrorCause {
  readonly message: string;
  readonly name: string;
  readonly stack?: string;
}

// ============================================================================
// Logger
// ============================================================================

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
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
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
