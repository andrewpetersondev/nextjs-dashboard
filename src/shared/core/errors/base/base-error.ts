import { isDev } from "@/shared/config/env-shared";
import {
  ERROR_CODES,
  type ErrorCode,
  getErrorCodeMeta,
  type Severity,
} from "@/shared/core/errors/base/error-codes";

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
        // eslint-disable-next-line no-console
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
 * @public
 * Represents a read-only context object containing error-related metadata.
 * @remarks
 * The keys are strings, and the values are unknown, allowing flexibility for diverse error details.
 */
export type ErrorContext = Readonly<Record<string, unknown>>;

/**
 * JSON-safe representation of a {@link BaseError}.
 *
 * - Intended for serialization across process or network boundaries
 *   (e.g. HTTP responses, logs, queues).
 * - Does **not** include stack traces or underlying `cause` to avoid
 *   leaking internal implementation details.
 * - `context` is only included if non-empty.
 */
export interface BaseErrorJson {
  readonly code: ErrorCode;
  readonly message: string;
  readonly statusCode: number;
  readonly severity: Severity;
  readonly retryable: boolean;
  readonly category: string;
  readonly description: string;
  readonly context?: ErrorContext;
}

/**
 * Constructor options for {@link BaseError}.
 *
 * Keeps the constructor signature small and stable while allowing:
 * - message override (defaults to error code description)
 * - structured diagnostic context
 * - an underlying cause (any unknown value)
 */
export interface BaseErrorOptions {
  /**
   * Human-readable error message.
   *
   * - Defaults to the description from the associated error code metadata.
   * - Used as the `Error.message` and in `toJson().message`.
   */
  readonly message?: string;

  /**
   * Arbitrary diagnostic context that will be:
   * - defensively cloned
   * - JSON-validated in development (with best-effort redaction)
   * - frozen to discourage mutation
   */
  readonly context?: ErrorContext;

  /**
   * Optional underlying cause. Can be:
   * - an `Error` instance (used as `cause` directly)
   * - any other value, which will be redacted into a JSON-safe shape
   * - `undefined`, meaning "no cause"
   */
  readonly cause?: unknown;
}

/**
 * Canonical application error type backed by centralized {@link ERROR_CODES}.
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
  readonly code: ErrorCode;
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

  constructor(code: ErrorCode, options: BaseErrorOptions = {}) {
    const meta = getErrorCodeMeta(code);
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
      cause: sanitizedCause as Error | undefined,
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
    try {
      Object.freeze(this);
    } catch {
      // ignore
    }
  }

  /**
   * Returns the immutable diagnostic context associated with this error.
   *
   * - The returned object is frozen; callers must not mutate it.
   * - Use {@link BaseError.withContext} to derive a new error
   *   with additional context instead of mutating this one.
   */
  getDetails(): ErrorContext {
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
  withContext<Textra extends ErrorContext>(extra: Textra): this {
    if (!extra || Object.keys(extra).length === 0) {
      return this;
    }
    const next = this.create(this.code, {
      cause: this.originalCause,
      context: { ...this.context, ...extra },
      message: this.message,
    }) as this;
    if (typeof this.stack === "string") {
      try {
        (next as { stack?: string }).stack = this.stack;
      } catch {
        // ignore
      }
    }
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
  remap(code: ErrorCode, overrideMessage?: string): this {
    if (code === this.code && !overrideMessage) {
      return this;
    }
    const next = this.create(code, {
      cause: this.originalCause,
      context: { ...this.context },
      message: overrideMessage ?? this.message,
    }) as this;
    if (typeof this.stack === "string") {
      try {
        (next as { stack?: string }).stack = this.stack;
      } catch {
        // ignore
      }
    }
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
    const base: BaseErrorJson = {
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
   * Normalizes any unknown thrown value into a {@link BaseError}.
   *
   * Cases:
   * - `BaseError` → returned as-is.
   * - `Error` → wrapped into a new `BaseError` using `fallbackCode`,
   *   preserving the original message as `message` and `cause`.
   * - anything else → converted into a JSON-safe representation and stored
   *   under `context.originalType` and `context.originalValue`.
   *
   * @param error - The value to normalize (e.g. from a `catch (error)` clause).
   * @param fallbackCode - Error code used when `error` is not already a `BaseError`.
   *                       Defaults to `ERROR_CODES.unknown.name`.
   * @param context - Additional context to attach/merge when creating the error.
   */
  static from(
    error: unknown,
    fallbackCode: ErrorCode = ERROR_CODES.unknown.name,
    context: ErrorContext = {},
  ): BaseError {
    if (error instanceof BaseError) {
      return error;
    }
    if (error instanceof Error) {
      return new BaseError(fallbackCode, {
        cause: error,
        context,
        message: error.message,
      });
    }
    const msg = safeStringifyUnknown(error);
    return new BaseError(fallbackCode, {
      context: {
        ...context,
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
   * - `BaseError` → remapped via {@link BaseError.remap} instead of double-wrapping.
   *   The original stack is copied to the remapped error when possible.
   * - `Error` → wrapped in a new `BaseError` using the provided `code` and `message`
   *   (or the original error's message if none is provided).
   * - anything else → converted into a JSON-safe representation and stored
   *   under `context.originalType` and `context.originalValue`.
   *
   * @param code - Target canonical error code.
   * @param err - Original error or thrown value.
   * @param context - Additional context to attach/merge.
   * @param message - Optional message override for the resulting error.
   */
  static wrap(
    code: ErrorCode,
    err: unknown,
    context: ErrorContext = {},
    message?: string,
  ): BaseError {
    if (err instanceof BaseError) {
      const remapped = err.remap(code, message);
      if (remapped !== err && typeof err.stack === "string") {
        try {
          (remapped as { stack?: string }).stack = err.stack;
        } catch {
          // ignore
        }
      }
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
   * - Subclasses can override this to customize how new instances are created
   *   (e.g. to add extra fields or enforce invariants).
   * - Default implementation instantiates `this.constructor` with the given
   *   `(code, options)` and falls back to `BaseError` if that fails.
   *
   * Called by {@link BaseError.withContext} and {@link BaseError.remap}.
   */
  protected create(code: ErrorCode, options: BaseErrorOptions): BaseError {
    const Ctor = this.constructor as new (
      c: ErrorCode,
      o: BaseErrorOptions,
    ) => BaseError;
    try {
      return new Ctor(code, options);
    } catch {
      return new BaseError(code, options);
    }
  }
}

/**
 * Type guard that narrows an unknown value to {@link BaseError}.
 *
 * Useful when handling errors from generic `catch` blocks to refine
 * the type before accessing `BaseError`-specific properties.
 *
 * @param e - Unknown value to check.
 * @returns `true` if `e` is a `BaseError`, otherwise `false`.
 */
export const isBaseError = (e: unknown): e is BaseError =>
  e instanceof BaseError;
