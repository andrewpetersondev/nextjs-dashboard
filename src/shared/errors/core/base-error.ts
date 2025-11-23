// src/shared/errors/core/base-error.ts
import { isDev } from "@/shared/config/env-shared";
import type {
  BaseErrorJson,
  BaseErrorOptions,
  ErrorContext,
  FieldErrors,
  FormErrors,
} from "@/shared/errors/core/base-error.types";
import {
  type AppErrorKey,
  type AppErrorLayer,
  getAppErrorCodeMeta,
  type Severity,
} from "@/shared/errors/core/error-codes";
import {
  buildUnknownValueContext,
  deepFreezeDev,
  redactNonSerializable,
  safeStringifyUnknown,
  validateAndMaybeSanitizeContext,
} from "@/shared/errors/core/error-helpers";

export class BaseError extends Error {
  readonly code: AppErrorKey;
  readonly description: string;
  readonly fieldErrors?: FieldErrors;
  readonly formErrors?: FormErrors;
  // Deprecated: keep for transition
  readonly context: ErrorContext;
  readonly layer: AppErrorLayer;
  readonly metadata: ErrorContext;
  readonly originalCause?: unknown;
  readonly retryable: boolean;
  readonly severity: Severity;

  constructor(code: AppErrorKey, options: BaseErrorOptions = {}) {
    const meta = getAppErrorCodeMeta(code);
    const { message, context, metadata, cause, formErrors, fieldErrors } =
      options;

    const sanitizedCause =
      cause instanceof Error
        ? cause
        : // biome-ignore lint/style/noNestedTernary: <keep for now>
          cause === undefined
          ? undefined
          : redactNonSerializable(cause);

    super(message ?? meta.description, { cause: sanitizedCause });
    this.name = this.constructor.name;
    this.code = code;
    this.description = meta.description;
    this.layer = meta.layer;
    this.retryable = meta.retryable;
    this.severity = meta.severity;

    // Merge old `context` and new `metadata`, with `metadata` taking precedence
    const merged = { ...(context ?? {}), ...(metadata ?? {}) };
    const checked = isDev() ? validateAndMaybeSanitizeContext(merged) : merged;
    const frozen = isDev()
      ? (deepFreezeDev(checked) as ErrorContext)
      : (Object.freeze(checked) as ErrorContext);
    this.metadata = frozen;
    this.context = frozen; // deprecated alias

    this.originalCause = cause;
    this.formErrors = formErrors ? Object.freeze([...formErrors]) : undefined;
    this.fieldErrors = fieldErrors
      ? Object.freeze({ ...fieldErrors })
      : undefined;

    try {
      Object.freeze(this);
    } catch {
      /* silent */
    }
  }

  static isBaseError(val: unknown): val is BaseError {
    return val instanceof BaseError;
  }

  static from(
    error: unknown,
    fallbackCode: AppErrorKey = "unknown",
  ): BaseError {
    if (error instanceof BaseError) {
      return error;
    }
    if (error instanceof Error) {
      return new BaseError(fallbackCode, {
        cause: error,
        message: error.message,
      });
    }
    return new BaseError(fallbackCode, {
      context: buildUnknownValueContext(error),
      message: safeStringifyUnknown(error),
    });
  }

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
      context: buildUnknownValueContext(err, context),
      message: message ?? "Wrapped unknown value",
    });
  }

  remap(code: AppErrorKey, overrideMessage?: string): this {
    if (code === this.code && !overrideMessage) {
      return this;
    }
    const next = this.create(code, {
      cause: this.originalCause,
      context: { ...this.context },
      fieldErrors: this.fieldErrors,
      formErrors: this.formErrors,
      message: overrideMessage ?? this.message,
    }) as this;
    this.copyStackTo(next);
    return next;
  }

  toJson(): BaseErrorJson {
    const hasMetadata = Object.keys(this.metadata).length > 0;
    return {
      code: this.code,
      description: this.description,
      ...(this.fieldErrors ? { fieldErrors: this.fieldErrors } : {}),
      ...(this.formErrors ? { formErrors: this.formErrors } : {}),
      layer: this.layer,
      message: this.message,
      ...(hasMetadata ? { metadata: this.metadata } : {}),
      retryable: this.retryable,
      severity: this.severity,
    };
  }

  protected create(code: AppErrorKey, options: BaseErrorOptions): BaseError {
    const Ctor = this.constructor as new (
      c: AppErrorKey,
      o: BaseErrorOptions,
    ) => BaseError;
    try {
      return new Ctor(code, options);
    } catch {
      return new BaseError(code, options);
    }
  }

  private copyStackTo(target: BaseError): void {
    if (typeof this.stack === "string") {
      try {
        (target as { stack?: string }).stack = this.stack;
      } catch {
        /* silent */
      }
    }
  }
}
