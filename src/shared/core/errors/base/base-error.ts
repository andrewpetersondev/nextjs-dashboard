import { IS_DEV } from "@/shared/config/env-shared";
import {
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
  if (!IS_DEV || obj === null || typeof obj !== "object") {
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
function validateAndMaybeSanitizeContext(
  ctx: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> {
  if (!IS_DEV) {
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

export interface BaseErrorJson {
  readonly code: ErrorCode;
  readonly message: string;
  readonly statusCode: number;
  readonly severity: Severity;
  readonly retryable: boolean;
  readonly category: string;
  readonly description: string;
  readonly context?: Readonly<Record<string, unknown>>;
}

/**
 * Construction options for BaseError to keep constructor signature minimal.
 */
export interface BaseErrorOptions {
  readonly message?: string;
  readonly context?: Readonly<Record<string, unknown>>;
  readonly cause?: unknown;
}

/**
 * Canonical application error with stable metadata derived from ERROR_CODES.
 * Immutable: context is defensively cloned & frozen.
 */
export class BaseError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly severity: Severity;
  readonly retryable: boolean;
  readonly category: string;
  readonly description: string;
  readonly context: Readonly<Record<string, unknown>>;
  readonly originalCause?: unknown;

  constructor(code: ErrorCode, options: BaseErrorOptions = {}) {
    const meta = getErrorCodeMeta(code);
    const { message, context, cause } = options;
    //    const sanitizedCause =
    //      cause instanceof Error
    //        ? cause
    //        : cause === undefined
    //          ? undefined
    //          : redactNonSerializable(cause);
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
    // Clone, dev-validate for serializability, optionally deep-freeze in dev
    const clonedContext = { ...(context ?? {}) };
    const checkedContext = IS_DEV
      ? validateAndMaybeSanitizeContext(clonedContext)
      : clonedContext;
    this.context = IS_DEV
      ? (deepFreezeDev(checkedContext) as Readonly<Record<string, unknown>>)
      : (Object.freeze(checkedContext) as Readonly<Record<string, unknown>>);
    this.originalCause = cause;
    // Freeze the instance in all envs (top-level)
    try {
      Object.freeze(this);
    } catch {
      // ignore non-extensible targets
    }
  }

  /**
   * Public accessor for immutable diagnostic details.
   */
  getDetails(): Readonly<Record<string, unknown>> {
    return this.context;
  }

  /**
   * Merge additional immutable context, returning a new BaseError.
   * Note: subclass identity is preserved via protected factory.
   */
  withContext<Textra extends Readonly<Record<string, unknown>>>(
    extra: Textra,
  ): this {
    if (!extra || Object.keys(extra).length === 0) {
      return this;
    }
    const next = this.create(this.code, {
      cause: this.originalCause,
      context: { ...this.context, ...extra },
      message: this.message,
    }) as this;
    // Preserve original stack where writable
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
   * Functional remap to a different canonical code (rare; use sparingly).
   * Preserves subclass via protected factory.
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
    // Preserve original stack where writable
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
   * Serialize to a stable JSON shape (no stack/cause leakage).
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
   * Normalize unknown into BaseError.
   * Uses consistent redaction fields with wrap().
   */
  static from(
    value: unknown,
    fallbackCode: ErrorCode = "unknown",
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
      context: {
        ...context,
        originalType: typeof value,
        originalValue: redactNonSerializable(value),
      },
      message: msg,
    });
  }

  /**
   * Wrap an error preserving original (never double-wrap BaseError).
   * Uses consistent redaction fields with from().
   */
  static wrap(
    code: ErrorCode,
    err: unknown,
    context: Readonly<Record<string, unknown>> = {},
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
   * Protected factory to preserve subclassing in helpers.
   * Subclasses can override to return their own instances.
   */
  protected create(code: ErrorCode, options: BaseErrorOptions): BaseError {
    // Preserve subclass by using the same constructor when possible
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
 * Narrow unknown to BaseError.
 * @param e - unknown value
 */
export const isBaseError = (e: unknown): e is BaseError =>
  e instanceof BaseError;
