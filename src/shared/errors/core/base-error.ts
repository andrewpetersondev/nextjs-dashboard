// src/shared/errors/core/base-error.ts
import { isDev } from "@/shared/config/env-shared";
import type {
  BaseErrorJson,
  BaseErrorOptions,
  ErrorMetadata,
} from "@/shared/errors/core/base-error.types";
import {
  type AppErrorKey,
  getAppErrorCodeMeta,
} from "@/shared/errors/core/error-codes";
import {
  buildUnknownValueMetadata,
  deepFreezeDev,
  redactNonSerializable,
  safeStringifyUnknown,
  validateAndMaybeSanitizeMetadata,
} from "@/shared/errors/core/error-helpers";
import type { AppErrorLayer, Severity } from "@/shared/errors/core/error-types";

/**
 * Standardized application error with transport-agnostic error codes.
 *
 * Form validation errors are stored in metadata:
 * - `metadata.fieldErrors`: per-field validation messages
 * - `metadata.formErrors`: global form-level messages
 *
 * Database errors preserve Postgres metadata in the metadata object.
 *
 * @example
 * // Form validation error
 * new BaseError("validation", {
 *   message: "Invalid input",
 *   metadata: {
 *     fieldErrors: { email: ["required"] },
 *     formErrors: ["Please fix errors"]
 *   }
 * })
 *
 * @example
 * // Database error with PG metadata
 * new BaseError("database", {
 *   message: "Duplicate key",
 *   cause: pgError,
 *   metadata: {
 *     table: "users",
 *     constraint: "users_email_key",
 *     pgCode: "23505"
 *   }
 * })
 */
export class BaseError extends Error {
  readonly code: AppErrorKey;
  readonly description: string;
  readonly layer: AppErrorLayer;
  readonly metadata: ErrorMetadata;
  readonly originalCause?: unknown;
  readonly retryable: boolean;
  readonly severity: Severity;

  /** @deprecated Use metadata instead */
  get context(): ErrorMetadata {
    return this.metadata;
  }

  constructor(code: AppErrorKey, options: BaseErrorOptions = {}) {
    const meta = getAppErrorCodeMeta(code);

    const { cause, context, message, metadata } = options;

    // Ensure cause is an Error, otherwise sanitize or set as undefined for safe error chaining.
    let sanitizedCause: unknown;
    if (cause instanceof Error) {
      sanitizedCause = cause;
    } else if (cause !== undefined) {
      sanitizedCause = redactNonSerializable(cause);
    }

    super(message ?? meta.description, { cause: sanitizedCause });

    this.code = code;
    this.description = meta.description;
    this.layer = meta.layer;
    this.name = this.constructor.name;
    this.originalCause = cause;
    this.retryable = meta.retryable;
    this.severity = meta.severity;

    // Merge old `context` and new `metadata`, with `metadata` taking precedence
    const merged = { ...(context ?? {}), ...(metadata ?? {}) };
    const checked = isDev() ? validateAndMaybeSanitizeMetadata(merged) : merged;
    this.metadata = isDev()
      ? (deepFreezeDev(checked) as ErrorMetadata)
      : (Object.freeze(checked) as ErrorMetadata);

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
      message: safeStringifyUnknown(error),
      metadata: buildUnknownValueMetadata(error),
    });
  }

  toJson(): BaseErrorJson {
    const hasMetadata = Object.keys(this.metadata).length > 0;
    return {
      code: this.code,
      description: this.description,
      layer: this.layer,
      message: this.message,
      ...(hasMetadata ? { metadata: this.metadata } : {}),
      retryable: this.retryable,
      severity: this.severity,
    };
  }
}
