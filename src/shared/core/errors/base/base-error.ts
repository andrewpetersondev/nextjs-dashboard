import { IS_DEV } from "@/shared/config/env-shared";
import {
  type ErrorCode,
  getErrorCodeMeta,
} from "@/shared/core/errors/base/error-codes";

// --- local helpers (not exported) ---

function safeStringifyUnknown(value: unknown): string {
  try {
    if (typeof value === "string") {
      return value;
    }
    return JSON.stringify(value, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v,
    );
  } catch {
    return "Non-serializable thrown value";
  }
}

function redactNonSerializable(value: unknown): unknown {
  if (value instanceof Error) {
    return { message: value.message, name: value.name };
  }
  try {
    JSON.stringify(value);
    return value;
  } catch {
    return { note: "non-serializable" };
  }
}

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
  readonly context?: BaseErrorContext;
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

  constructor(code: ErrorCode, options: BaseErrorOptions = {}) {
    const meta = getErrorCodeMeta(code);
    const { message, context, cause } = options;
    super(
      message ?? meta.description,
      cause instanceof Error ? { cause } : undefined,
    );
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = meta.httpStatus;
    this.severity = meta.severity;
    this.retryable = meta.retryable;
    this.category = meta.category;
    this.description = meta.description;
    this.context = Object.freeze({ ...(context ?? {}) });
    this.cause = cause;
    // Freeze the instance in dev to enforce immutability
    if (IS_DEV) {
      Object.freeze(this);
    }
  }

  /**
   * Public accessor for immutable diagnostic details.
   */
  getDetails(): BaseErrorContext {
    return this.context;
  }

  /**
   * Merge additional immutable context, returning a new BaseError.
   * Note: subclass identity is not preserved unless create() is overridden.
   */
  withContext(extra: Readonly<Record<string, unknown>>): BaseError {
    if (!extra || Object.keys(extra).length === 0) {
      return this;
    }
    return this.create(this.code, {
      cause: this.cause,
      context: { ...this.context, ...extra },
      message: this.message,
    });
  }

  /**
   * Functional remap to a different canonical code (rare; use sparingly).
   */
  remap(code: ErrorCode, overrideMessage?: string): BaseError {
    if (code === this.code && !overrideMessage) {
      return this;
    }
    return this.create(code, {
      cause: this.cause,
      context: { ...this.context },
      message: overrideMessage ?? this.message,
    });
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
   * Normalize unknown into BaseError.
   */
  static from(
    value: unknown,
    fallbackCode: ErrorCode = "UNKNOWN",
    context: Readonly<Record<string, unknown>> = {},
  ): BaseError {
    if (value instanceof BaseError) {
      return value;
    }
    if (value instanceof Error) {
      return new BaseError(fallbackCode, {
        cause: value,
        context,
        message: value.message,
      });
    }
    const msg = safeStringifyUnknown(value);
    return new BaseError(fallbackCode, {
      context: { ...context, originalType: typeof value },
      message: msg,
    });
  }

  /**
   * Wrap an error preserving original (never double-wrap BaseError).
   */
  static wrap(
    code: ErrorCode,
    err: unknown,
    context: Readonly<Record<string, unknown>> = {},
    message?: string,
  ): BaseError {
    if (err instanceof BaseError) {
      return err.remap(code, message);
    }
    if (err instanceof Error) {
      return new BaseError(code, {
        cause: err,
        context,
        message: message ?? err.message,
      });
    }
    return new BaseError(code, {
      context: { ...context, originalValue: redactNonSerializable(err) },
      message: message ?? "Wrapped unknown value",
    });
  }

  /**
   * Protected factory to preserve subclassing in helpers.
   * Subclasses can override to return their own instances.
   */
  protected create(code: ErrorCode, options: BaseErrorOptions): BaseError {
    return new BaseError(code, options);
  }
}

/**
 * Narrow unknown to BaseError.
 * @param e - unknown value
 */
export const isBaseError = (e: unknown): e is BaseError =>
  e instanceof BaseError;
