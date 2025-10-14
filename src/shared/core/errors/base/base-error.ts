import {
  type ErrorCode,
  getErrorCodeMeta,
} from "@/shared/core/errors/base/error-codes";

/**
 * Immutable, JSON-safe diagnostic context attached to an error.
 */
export type BaseErrorContext = Readonly<Record<string, unknown>>;

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
 * Construction options for BaseError to keep constructor signature minimal.
 */
export interface BaseErrorOptions {
  readonly message?: string;
  readonly context?: BaseErrorContext;
  readonly cause?: unknown;
}

/**
 * Canonical application error with stable metadata derived from ERROR_CODES.
 * Immutable: context is defensively cloned & frozen.
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
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    const meta = getErrorCodeMeta(code);
    super(
      message || meta.description,
      cause instanceof Error ? { cause } : undefined,
    );
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = meta.httpStatus;
    this.severity = meta.severity;
    this.retryable = meta.retryable;
    this.category = meta.category;
    this.description = meta.description;
    this.context = Object.freeze({ ...context });
    this.cause = cause;
  }

  /**
   * Public accessor for immutable diagnostic details.
   */
  getDetails(): Readonly<Record<string, unknown>> {
    return this.context;
  }

  /**
   * Merge additional immutable context, returning a new BaseError.
   * Note: subclass identity is not preserved.
   */
  withContext(extra: Record<string, unknown>): BaseError {
    if (!extra || Object.keys(extra).length === 0) {
      return this;
    }
    return new BaseError(
      this.code,
      this.message,
      { ...this.context, ...extra },
      this.cause,
    );
  }

  /**
   * Functional remap to a different canonical code (rare; use sparingly).
   */
  remap(code: ErrorCode, overrideMessage?: string): BaseError {
    if (code === this.code && !overrideMessage) {
      return this;
    }
    return new BaseError(
      code,
      overrideMessage || this.message,
      { ...this.context },
      this.cause,
    );
  }

  /**
   * Serialize to a stable JSON shape (no stack/cause leakage).
   */
  toJSON(): BaseErrorJSON {
    const base: BaseErrorJSON = {
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
    return base;
  }

  /**
   * Normalize unknown into BaseError (lightweight alternative to mapToBaseError).
   */
  static from(
    value: unknown,
    fallbackCode: ErrorCode = "UNKNOWN",
    context: Record<string, unknown> = {},
  ): BaseError {
    if (value instanceof BaseError) {
      return value;
    }
    if (value instanceof Error) {
      return new BaseError(fallbackCode, value.message, context, value);
    }
    let msg: string;
    try {
      msg =
        typeof value === "string"
          ? value
          : JSON.stringify(value, (_k, v) =>
              typeof v === "bigint" ? v.toString() : v,
            );
    } catch {
      msg = "Non-serializable thrown value";
    }
    return new BaseError(fallbackCode, msg, {
      ...context,
      originalType: typeof value,
    });
  }

  /**
   * Wrap an error preserving original (never double-wrap BaseError).
   */
  static wrap(
    code: ErrorCode,
    err: unknown,
    context: Record<string, unknown> = {},
    message?: string,
  ): BaseError {
    if (err instanceof BaseError) {
      return err.remap(code, message);
    }
    if (err instanceof Error) {
      return new BaseError(code, message || err.message, context, err);
    }
    return new BaseError(code, message || "Wrapped unknown value", {
      ...context,
      originalValue: err,
    });
  }
}
