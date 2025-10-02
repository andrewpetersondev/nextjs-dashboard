import {
  type ErrorCode,
  getErrorCodeMeta,
} from "@/shared/core/errors/error-codes";

export interface BaseErrorContext {
  readonly [key: string]: unknown;
}

export interface BaseErrorJSON {
  readonly code: ErrorCode;
  readonly message: string;
  readonly statusCode: number;
  readonly severity: string;
  readonly retryable: boolean;
  readonly category: string;
  readonly description: string;
  readonly context?: Record<string, unknown>;
}

/**
 * Canonical application error with stable metadata derived from `ERROR_CODES`.
 *
 * All domain / infrastructure error types extend this class to ensure:
 * - Consistent `code`, `statusCode`, `retryable`, `severity`, `category`.
 * - Safe, shallow-serializable `context`.
 * - Optional `cause` preserved (appended to stack trace for diagnostics).
 *
 * Never mutate an instance; treat as immutable value object.
 */
export class BaseError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly severity: string;
  readonly retryable: boolean;
  readonly category: string;
  readonly description: string;
  readonly context: BaseErrorContext;
  readonly cause?: unknown;

  /**
   * @param code Error code (must exist in `ERROR_CODES`).
   * @param message Optional override; defaults to code description.
   * @param context Additional non-sensitive diagnostic data (redacted upstream if needed).
   * @param cause Underlying error or value; not exposed in `toJSON`, but its stack is appended.
   */
  constructor(
    code: ErrorCode,
    message?: string,
    context: BaseErrorContext = {},
    cause?: unknown,
  ) {
    const meta = getErrorCodeMeta(code);
    super(message || meta.description);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = meta.httpStatus;
    this.severity = meta.severity;
    this.retryable = meta.retryable;
    this.category = meta.category;
    this.description = meta.description;
    this.context = context;
    this.cause = cause;
    if (cause instanceof Error && cause.stack) {
      this.stack += `\nCaused By: ${cause.stack}`;
    }
  }

  toJSON(): BaseErrorJSON {
    return {
      category: this.category,
      code: this.code,
      description: this.description,
      message: this.message,
      retryable: this.retryable,
      severity: this.severity,
      statusCode: this.statusCode,
      ...(Object.keys(this.context).length > 0
        ? { context: this.context }
        : {}),
    };
  }
}
