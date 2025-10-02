import {
  type ErrorCode,
  getErrorCodeMeta,
} from "@/shared/core/errors/error-codes";

export interface BaseErrorContext {
  readonly [key: string]: unknown;
}

export interface BaseErrorJSON {
  code: ErrorCode;
  message: string;
  statusCode: number;
  severity: string;
  retryable: boolean;
  category: string;
  description: string;
  context?: Record<string, unknown>;
}

/**
 * Standardized application error with rich metadata.
 *
 * All custom errors should extend this class (directly or indirectly).
 * Changed from abstract to this. what does that mean?
 *
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
    // Optional: capture stack without leaking cause stack externally
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
