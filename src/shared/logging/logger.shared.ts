// src/shared/logging/logger.shared.ts
import {
  getPublicLogLevel,
  getRuntimeNodeEnv,
} from "@/shared/config/env-public";
import type { LogLevel } from "@/shared/config/env-schemas";
import { getProcessId } from "@/shared/config/env-utils";
import { isBaseError } from "@/shared/core/errors/base-error";
import { DEFAULT_SENSITIVE_KEYS } from "@/shared/core/errors/redaction/redaction.constants";

// ============================================================================
// Types & Interfaces
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

// ============================================================================
// Constants
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
// Utility Functions
// ============================================================================

/**
 * Recursively sanitize objects to redact sensitive fields.
 */
function sanitize(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sanitize);
  }
  if (data instanceof Date || data instanceof RegExp) {
    return data;
  }
  if (data && typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [
        k,
        DEFAULT_SENSITIVE_KEYS.some((rk) => k.toLowerCase().includes(rk))
          ? "[REDACTED]"
          : sanitize(v),
      ]),
    );
  }
  return data;
}

/**
 * Derive the effective public log level at runtime.
 * Falls back to 'info' if the public env var is missing/invalid.
 */
function getEffectiveLogLevel(): LogLevel {
  try {
    return getPublicLogLevel();
  } catch {
    return "info";
  }
}

function getCurrentLevelPriority(): number {
  const envLevel = getEffectiveLogLevel();
  return levelPriority[envLevel];
}

// ============================================================================
// Logger Class
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
  // Private Helper Methods
  // --------------------------------------------------------------------------

  private shouldLog(level: LogLevel): boolean {
    return levelPriority[level] <= getCurrentLevelPriority();
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

    if (this.context !== undefined) {
      entry.context = this.context;
    }
    if (this.requestId !== undefined) {
      entry.requestId = this.requestId;
    }
    if (processId !== undefined) {
      entry.pid = processId;
    }
    if (data !== undefined) {
      entry.data = sanitize(data) as T;
    }

    return entry;
  }

  private format(entry: LogEntry): unknown[] {
    if (getRuntimeNodeEnv() === "production") {
      return [JSON.stringify(entry)];
    }

    const prefixParts: string[] = [entry.timestamp];
    if (entry.requestId) {
      prefixParts.push(`[req:${entry.requestId}]`);
    }
    if (entry.context) {
      prefixParts.push(`[${entry.context}]`);
    }

    const prefix = prefixParts.join(" ");
    return entry.data !== undefined
      ? [prefix, entry.message, entry.data]
      : [prefix, entry.message];
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }
    const formatted = this.format(entry);
    consoleMethod[entry.level](...formatted);
  }

  private logAtLevel<T>(level: LogLevel, message: string, data?: T): void {
    this.output(this.createEntry(level, message, data));
  }

  // --------------------------------------------------------------------------
  // Public Logging Methods
  // --------------------------------------------------------------------------

  trace<T>(message: string, data?: T): void {
    this.logAtLevel("trace", message, data);
  }

  debug<T>(message: string, data?: T): void {
    this.logAtLevel("debug", message, data);
  }

  info<T>(message: string, data?: T): void {
    this.logAtLevel("info", message, data);
  }

  warn<T>(message: string, data?: T): void {
    this.logAtLevel("warn", message, data);
  }

  error<T>(message: string, data?: T): void {
    this.logAtLevel("error", message, data);
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

  // --------------------------------------------------------------------------
  // Specialized Logging Methods
  // --------------------------------------------------------------------------

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
  errorWithDetails(message: string, error: unknown): void {
    if (!isBaseError(error)) {
      // Fallback for non-BaseError
      this.error(message, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return;
    }

    const errorData: Record<string, unknown> = {
      category: error.category,
      code: error.code,
      context: error.context,
      message: error.message,
      retryable: error.retryable,
      severity: error.severity,
      stack: error.stack,
    };

    // Include cause chain if present
    if (error.cause instanceof Error) {
      errorData.cause = {
        message: error.cause.message,
        name: error.cause.name,
        stack: error.cause.stack,
      };
    }

    this.error(message, errorData);
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
   *   additionalField: 'value',
   * });
   * ```
   */
  operation<T extends Record<string, unknown> = Record<string, unknown>>(
    level: LogLevel,
    message: string,
    data: OperationData<T>,
  ): void {
    const { operation, context, identifiers, ...rest } = data;

    // Build the structured log data
    const logData = {
      operation,
      ...(identifiers ?? {}),
      ...rest,
    };

    // Use withContext if context provided in data
    const targetLogger = context ? this.withContext(context) : this;

    // Delegate to the appropriate log level
    targetLogger.logAtLevel(level, message, logData);
  }
}

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default shared instance
 */
export const logger = new Logger();
