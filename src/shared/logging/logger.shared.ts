// src/shared/logging/logger.shared.ts
import {
  getPublicLogLevel,
  getRuntimeNodeEnv,
} from "@/shared/config/env-public";
import type { LogLevel } from "@/shared/config/env-schemas";
import { getProcessId } from "@/shared/config/env-utils";
import {
  type BaseError,
  isBaseError,
} from "@/shared/core/errors/base/base-error";
import { DEFAULT_SENSITIVE_KEYS as redactedKeys } from "@/shared/core/errors/redaction/redaction.constants";

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
 * Recursively sanitize objects to redact sensitive fields.
 */
function sanitize(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(sanitize);
  }
  if (data && typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [
        k,
        redactedKeys.some((rk) => k.toLowerCase().includes(rk))
          ? "[REDACTED]"
          : sanitize(v),
      ]),
    );
  }
  return data;
}

/**
 * Cached console methods for minimal overhead.
 */
const consoleMethod: Record<LogLevel, (...args: unknown[]) => void> = {
  debug: console.debug.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  trace: console.trace.bind(console),
  warn: console.warn.bind(console),
};

const processId = getProcessId();

/**
 * Derive the effective public log level at runtime.
 * Falls back to 'info' if the public env var is missing/invalid.
 */
function getEffectiveLogLevel(): LogLevel {
  try {
    return getPublicLogLevel();
  } catch (error) {
    console.warn(
      "Failed to get NEXT_PUBLIC_LOG_LEVEL, falling back to 'info':",
      error instanceof Error ? error.message : String(error),
    );
    return "info";
  }
}

function getCurrentLevelPriority(): number {
  const envLevel = getEffectiveLogLevel();
  return levelPriority[envLevel];
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

  private shouldLog(level: LogLevel): boolean {
    return levelPriority[level] <= getCurrentLevelPriority();
  }

  private createEntry<T>(
    level: LogLevel,
    message: string,
    data?: T,
  ): LogEntry<T> {
    const entry: LogEntry<T> = {
      context: this.context,
      level,
      message,
      pid: processId,
      requestId: this.requestId,
      timestamp: new Date().toISOString(),
    };

    if (data !== undefined) {
      entry.data = sanitize(data) as T;
    }

    return entry;
  }

  private format(entry: LogEntry): unknown[] {
    if (getRuntimeNodeEnv() === "production") {
      return [JSON.stringify(entry)];
    }

    const { timestamp, context, message, data, requestId } = entry;
    const prefixParts = [timestamp];
    if (requestId) {
      prefixParts.push(`[req:${requestId}]`);
    }
    if (context) {
      prefixParts.push(`[${context}]`);
    }

    const prefix = prefixParts.join(" ");
    return data !== undefined ? [prefix, message, data] : [prefix, message];
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }
    const formatted = this.format(entry);
    consoleMethod[entry.level](...formatted);
  }

  trace<T>(message: string, data?: T): void {
    this.output(this.createEntry("trace", message, data));
  }

  debug<T>(message: string, data?: T): void {
    this.output(this.createEntry("debug", message, data));
  }

  info<T>(message: string, data?: T): void {
    this.output(this.createEntry("info", message, data));
  }

  warn<T>(message: string, data?: T): void {
    this.output(this.createEntry("warn", message, data));
  }

  error<T>(message: string, data?: T): void {
    this.output(this.createEntry("error", message, data));
  }

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

  /**
   * Log a BaseError with full diagnostic information (internal use only).
   * Includes stack traces and cause chains for debugging.
   *
   * @example
   * ```typescript
   * try {
   *   await operation();
   * } catch (err) {
   *   const baseError = BaseError.from(err);
   *   logger.errorWithDetails('Operation failed', baseError);
   *   throw baseError;
   * }
   * ```
   */
  errorWithDetails(message: string, error: BaseError | unknown): void {
    if (!isBaseError(error)) {
      // Fallback for non-BaseError
      this.error(message, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return;
    }

    this.error(message, {
      category: error.category,
      code: error.code,
      context: error.context,
      message: error.message,
      retryable: error.retryable,
      severity: error.severity,
      stack: error.stack,
      // Include cause chain if present
      ...(error.cause instanceof Error
        ? {
            cause: {
              message: error.cause.message,
              name: error.cause.name,
              stack: error.cause.stack,
            },
          }
        : {}),
    });
  }

  /**
   * Log with operation context for DAL/repository patterns.
   * Automatically includes operation, context, and identifiers.
   *
   * @example
   * ```typescript
   * logger.operation('info', 'User fetched', {
   *   operation: 'getUserByEmail',
   *   context: 'dal.users',
   *   identifiers: { email: 'user@example.com' },
   * });
   * ```
   */
  operation<T extends Record<string, unknown>>(
    level: LogLevel,
    message: string,
    data: T & {
      operation: string;
      context?: string;
      identifiers?: Record<string, unknown>;
    },
  ): void {
    const logData = {
      operation: data.operation,
      ...(data.identifiers || {}),
      ...Object.fromEntries(
        Object.entries(data).filter(
          ([k]) => k !== "operation" && k !== "context" && k !== "identifiers",
        ),
      ),
    };

    // Use withContext if context provided in data
    const targetLogger = data.context ? this.withContext(data.context) : this;

    switch (level) {
      case "trace":
        targetLogger.trace(message, logData);
        break;
      case "debug":
        targetLogger.debug(message, logData);
        break;
      case "info":
        targetLogger.info(message, logData);
        break;
      case "warn":
        targetLogger.warn(message, logData);
        break;
      case "error":
        targetLogger.error(message, logData);
        break;
      default:
        targetLogger.error(message, logData);
        break;
    }
  }
}
/**
 * Default shared instance
 */
export const logger = new Logger();
