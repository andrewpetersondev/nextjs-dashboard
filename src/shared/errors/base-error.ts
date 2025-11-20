import { isDev } from "@/shared/config/env-shared";
import type {
  BaseErrorJson,
  BaseErrorOptions,
  ErrorContext,
} from "@/shared/errors/base-error.types";
import {
  APP_ERROR_MAP,
  type AppErrorKey,
  getAppErrorCodeMeta,
  type Severity,
} from "@/shared/errors/error-codes";

function safeStringifyUnknown(value: unknown): string {
  try {
    if (typeof value === "string") {
      return value;
    }
    const json = JSON.stringify(value, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v,
    );
    const Max = 10_000; // limit ~10KB
    if (json.length > Max) {
      return `${json.slice(0, Max)}…[truncated ${json.length - Max} chars]`;
    }
    return json ?? String(value);
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

// Shallow-deep freeze for dev to discourage mutation without heavy perf cost
function deepFreezeDev<T>(obj: T): T {
  if (!isDev() || obj === null || typeof obj !== "object") {
    return obj;
  }
  const seen = new WeakSet<object>();
  const freeze = (o: object): void => {
    if (seen.has(o)) {
      return;
    }
    seen.add(o);

    for (const key of Object.getOwnPropertyNames(o)) {
      const v = (o as Record<string, unknown>)[key];
      if (v && typeof v === "object") {
        try {
          freeze(v as object);
        } catch {
          // ignore circular or non-configurable props
        }
      }
    }
    try {
      Object.freeze(o);
    } catch {
      // ignore non-extensible targets
    }
  };
  freeze(obj as unknown as object);
  return obj;
}

// Dev-only: ensure context is JSON-serializable; redact offending entries
function validateAndMaybeSanitizeContext(ctx: ErrorContext): ErrorContext {
  if (!isDev()) {
    return ctx;
  }

  // Warn about likely misplaced logging metadata. TODO: MOVE THIS TO A CENTRAL LOCATION
  const loggingKeys = [
    "requestId",
    "hostname",
    "traceId",
    "spanId",
    "environment",
  ];
  const foundKeys = loggingKeys.filter((k) => k in ctx);
  if (foundKeys.length > 0) {
    console.warn(
      "[BaseError] Context contains logging-like keys that should use LoggingContext instead:",
      foundKeys.join(", "),
    );
  }

  // Existing serialization validation...
  try {
    JSON.stringify(ctx);
    return ctx;
  } catch {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(ctx)) {
      try {
        JSON.stringify(v);
        sanitized[k] = v;
      } catch {
        console.warn("[BaseError] Redacted non-serializable context value:", k);
        sanitized[k] = redactNonSerializable(v);
      }
    }
    try {
      JSON.stringify(sanitized);
      return sanitized;
    } catch {
      return { note: "context-redacted-non-serializable" };
    }
  }
}

/**
 * Canonical application error type backed by centralized {@link APP_ERROR_MAP}.
 *
 * Core guarantees:
 * - **Stable metadata** from `getErrorCodeMeta` (code, status, severity, etc.).
 * - **Immutable instances**: `context` is cloned and frozen; the error
 *   instance is frozen where possible.
 * - **Safe causes**: non-`Error` causes are converted into JSON-safe shapes
 *   and attached as `Error.cause` in a controlled way.
 * - **Subclass-friendly**: helpers like {@link BaseError.withContext},
 *   {@link BaseError.remap}, {@link BaseError.from}, and {@link BaseError.wrap}
 *   preserve subclass identity via {@link BaseError.create}.
 */
export class BaseError extends Error {
  readonly code: AppErrorKey;
  readonly statusCode: number;
  readonly severity: Severity;
  readonly retryable: boolean;
  readonly category: string;
  readonly description: string;
  readonly context: ErrorContext;
  /**
   * The original `cause` value passed in the constructor options.
   *
   * - May differ from `Error.cause` when a non-`Error` value is supplied,
   *   since those are redacted before being passed to the base `Error`.
   */
  readonly originalCause?: unknown;
  readonly formErrors?: readonly string[];
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;

  constructor(code: AppErrorKey, options: BaseErrorOptions = {}) {
    const meta = getAppErrorCodeMeta(code);
    const { message, context, cause } = options;
    let sanitizedCause: unknown;
    switch (true) {
      case cause instanceof Error:
        sanitizedCause = cause;
        break;
      case cause === undefined:
        sanitizedCause = undefined;
        break;
      default:
        sanitizedCause = redactNonSerializable(cause);
    }
    super(message ?? meta.description, {
      cause: sanitizedCause,
    });
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = meta.httpStatus;
    this.severity = meta.severity;
    this.retryable = meta.retryable;
    this.category = meta.category;
    this.description = meta.description;
    const clonedContext = { ...(context ?? {}) };
    const checkedContext = isDev()
      ? validateAndMaybeSanitizeContext(clonedContext)
      : clonedContext;
    this.context = isDev()
      ? (deepFreezeDev(checkedContext) as ErrorContext)
      : (Object.freeze(checkedContext) as ErrorContext);
    this.originalCause = cause;
    this.formErrors = options.formErrors
      ? Object.freeze([...options.formErrors])
      : undefined;
    this.fieldErrors = options.fieldErrors
      ? Object.freeze({ ...options.fieldErrors })
      : undefined;
    try {
      Object.freeze(this);
    } catch {
      // ignore
      console.log("error occurred in base error constructor");
    }
  }

  /**
   * Returns the immutable diagnostic context associated with this error.
   *
   * - The returned object is frozen; callers must not mutate it.
   * - Use {@link BaseError.withContext} to derive a new error
   *   with additional context instead of mutating this one.
   */
  getContext(): ErrorContext {
    return this.context;
  }

  /**
   * Returns a new error instance with additional immutable context merged in.
   *
   * Behavior:
   * - Does **not** mutate the current error.
   * - Shallow-merges `extra` into existing `context`, with `extra` keys
   *   winning on conflict.
   * - Preserves subclass identity via {@link BaseError.create}.
   * - Copies the current `stack` onto the derived instance when possible.
   *
   * If `extra` is empty or falsy, the current instance is returned.
   */
  withContext<T extends ErrorContext>(extra: T): this {
    if (!extra || Object.keys(extra).length === 0) {
      return this;
    }
    const next = this.create(this.code, {
      cause: this.originalCause,
      context: { ...this.context, ...extra },
      message: this.message,
    }) as this;
    this.copyStackTo(next);
    return next;
  }

  /**
   * Derives a new error instance mapped to a different canonical code.
   *
   * Behavior:
   * - If `code` and `message` are unchanged, returns `this`.
   * - Otherwise constructs a new instance with:
   *   - the new `code`
   *   - the same `originalCause`
   *   - a cloned copy of the current `context`
   *   - `overrideMessage` if provided; otherwise the current `message`
   * - Preserves subclass identity via {@link BaseError.create}.
   * - Copies the current `stack` where possible.
   */
  remap(code: AppErrorKey, overrideMessage?: string): this {
    if (code === this.code && !overrideMessage) {
      return this;
    }
    const next = this.create(code, {
      cause: this.originalCause,
      context: { ...this.context },
      message: overrideMessage ?? this.message,
    }) as this;
    this.copyStackTo(next);
    return next;
  }

  /**
   * Produces a JSON-safe representation of this error.
   *
   * Includes:
   * - core metadata (code, category, severity, retryable, statusCode, description)
   * - `message` (possibly overridden in the constructor)
   * - `context` if non-empty
   *
   * Excludes:
   * - stack traces
   * - raw `cause` / `originalCause`
   *
   * This is suitable for logs or API responses where you want structured,
   * stable error data without leaking internal details.
   */
  toJson(): BaseErrorJson {
    const hasContext = Object.keys(this.context).length > 0;

    const json: BaseErrorJson = {
      category: this.category,
      code: this.code,
      ...(hasContext ? { context: this.context } : {}),
      description: this.description,
      ...(this.fieldErrors ? { fieldErrors: this.fieldErrors } : {}),
      ...(this.formErrors ? { formErrors: this.formErrors } : {}),
      message: this.message,
      retryable: this.retryable,
      severity: this.severity,
      statusCode: this.statusCode,
    };

    return json;
  }

  /**
   * Normalizes any unknown thrown value into a {@link BaseError}.
   *
   * Cases:
   * - `BaseError` → returned as-is (use `.withContext()` to add more context)
   * - `Error` → wrapped into a new `BaseError` using `fallbackCode`,
   *   preserving the original message and cause
   * - anything else → converted into a JSON-safe representation and stored
   *   in context as `originalType` and `originalValue`
   *
   * @param error - The value to normalize (e.g. from a `catch (error)` clause)
   * @param fallbackCode - Error code used when `error` is not already a `BaseError`
   *                       Defaults to `ERROR_CODES.unknown.name`
   *
   * @example
   * ```typescript
   * try {
   *   await riskyOperation();
   * } catch (err) {
   *   const baseErr = BaseError.from(err, 'OPERATION_FAILED');
   *   // Add context separately if needed:
   *   throw baseErr.withContext({ userId: '123' });
   * }
   */
  static from(
    error: unknown,
    fallbackCode: AppErrorKey = "unknown",
  ): BaseError {
    if (error instanceof BaseError) {
      return error; // No merging—caller should use .withContext() if needed
    }
    if (error instanceof Error) {
      return new BaseError(fallbackCode, {
        cause: error,
        message: error.message,
      });
    }
    const msg = safeStringifyUnknown(error);
    return new BaseError(fallbackCode, {
      context: {
        originalType: typeof error,
        originalValue: redactNonSerializable(error),
      },
      message: msg,
    });
  }

  /**
   * Wraps an arbitrary error value with a specific `code`, preserving the original.
   *
   * Cases:
   * - `BaseError` → remapped via {@link BaseError.remap}
   * - `Error` → wrapped in a new `BaseError` with the original as `cause`
   * - anything else → converted to JSON-safe representation in context
   *
   * @param code - Target canonical error code
   * @param err - Original error or thrown value
   * @param context - Diagnostic context for the wrapping layer
   *   (e.g., `{ operation: 'fetchUser', userId: '123' }`)
   * @param message - Optional message override
   *
   * @example
   * ```typescript
   * try {
   *   await db.query(sql);
   * } catch (dbErr) {
   *   throw BaseError.wrap(
   *     'DATABASE_QUERY_FAILED',
   *     dbErr,
   *     { query: 'SELECT * FROM users', userId: '123' },
   *     'Failed to fetch user from database'
   *   );
   * }
   */
  static wrap(
    code: AppErrorKey,
    err: unknown,
    context: ErrorContext = {},
    message?: string,
  ): BaseError {
    if (err instanceof BaseError) {
      const remapped = err.remap(code, message);
      err.copyStackTo(remapped);
      return remapped;
    }
    if (err instanceof Error) {
      return new BaseError(code, {
        cause: err,
        context,
        message: message ?? err.message,
      });
    }
    return new BaseError(code, {
      context: {
        ...context,
        originalType: typeof err,
        originalValue: redactNonSerializable(err),
      },
      message: message ?? "Wrapped unknown value",
    });
  }

  /**
   * Protected factory method used by helpers to construct new instances.
   *
   * Designed for subclassing:
   * - Subclasses with a custom constructor signature SHOULD override this
   *   method to correctly reconstruct themselves from `(code, options)`.
   * - Default implementation instantiates `this.constructor` with the given
   *   `(code, options)` and falls back to `BaseError` if that fails.
   *
   * Called by {@link BaseError.withContext} and {@link BaseError.remap}.
   */
  protected create(code: AppErrorKey, options: BaseErrorOptions): BaseError {
    const Ctor = this.constructor as new (
      c: AppErrorKey,
      o: BaseErrorOptions,
    ) => BaseError;
    try {
      return new Ctor(code, options);
    } catch (err) {
      if (isDev()) {
        console.warn(
          `[BaseError] Subclass ${this.constructor.name} failed to reconstruct; falling back to BaseError`,
          err,
        );
      }
      return new BaseError(code, options);
    }
  }

  private copyStackTo(target: BaseError): void {
    if (typeof this.stack === "string") {
      try {
        (target as { stack?: string }).stack = this.stack;
      } catch {
        // ignore
      }
    }
  }
}
