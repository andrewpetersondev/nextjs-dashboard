/**
 * Minimal logger interface to allow dependency injection (console, pino, bunyan, etc.).
 */
export interface LoggerLike {
  error: (...args: readonly unknown[]) => void;
  warn: (...args: readonly unknown[]) => void;
  info: (...args: readonly unknown[]) => void;
}

/**
 * Structured shape emitted for each error; safe to serialize.
 */
export interface StructuredErrorLog {
  readonly timestamp: string;
  readonly level: "error" | "warn" | "info";
  readonly code: string;
  readonly name: string;
  readonly message: string;
  readonly statusCode?: number;
  readonly operation?: string;
  readonly retryable?: boolean;
  readonly transient?: boolean;
  readonly context?: Record<string, unknown>;
  readonly extra?: Record<string, unknown>;
  readonly stack?: string;
  readonly cause?: string;
}

/**
 * Options object for logError.
 */
export interface LogErrorOptions {
  readonly error: unknown;
  /**
   * Extra ad-hoc fields (requestId, userId, etc.). Avoid secrets.
   */
  readonly extra?: Record<string, unknown>;
  /**
   * Override logging level (default: 'error').
   */
  readonly level?: "error" | "warn" | "info";
  /**
   * Optional logger; defaults to console.
   */
  readonly logger?: LoggerLike;
  readonly operation?: string;
  /**
   * Redaction hook: remove/transform sensitive fields inside context before logging.
   */
  readonly redact?: (
    ctx: Record<string, unknown> | undefined,
  ) => Record<string, unknown> | undefined;
}
