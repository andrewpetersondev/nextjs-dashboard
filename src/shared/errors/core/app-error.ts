import { isDev } from "@/shared/config/env-shared";
import {
  type AppErrorKey,
  getAppErrorCodeMeta,
} from "@/shared/errors/catalog/app-error.registry";
import type {
  AppErrorJson,
  AppErrorOptions,
  ErrorMetadata,
} from "@/shared/errors/core/app-error.types";
import type { AppErrorLayer, Severity } from "@/shared/errors/core/definitions";
import {
  buildUnknownValueMetadata,
  deepFreezeDev,
  redactNonSerializable,
  safeStringifyUnknown,
  validateAndMaybeSanitizeMetadata,
} from "@/shared/errors/utils/serialization";

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
 * new AppError("validation", {
 *   message: "Invalid input",
 *   metadata: {
 *     fieldErrors: { email: ["required"] },
 *     formErrors: ["Please fix errors"]
 *   }
 * })
 *
 * @example
 * // Database error with PG metadata
 * new AppError("database", {
 *   message: "Duplicate key",
 *   cause: pgError,
 *   metadata: {
 *     table: "users",
 *     constraint: "users_email_key",
 *     pgCode: "23505"
 *   }
 * })
 */
export class AppError extends Error {
  readonly code: AppErrorKey;
  readonly description: string;
  readonly layer: AppErrorLayer;
  readonly metadata: ErrorMetadata;
  readonly originalCause?: unknown;
  readonly retryable: boolean;
  readonly severity: Severity;

  constructor(code: AppErrorKey, options: AppErrorOptions) {
    const meta = getAppErrorCodeMeta(code);

    const { cause, message, metadata } = options;

    // Ensure cause is an Error, otherwise sanitize or set as undefined for safe error chaining.
    let sanitizedCause: unknown;
    if (cause instanceof Error) {
      sanitizedCause = cause;
    } else if (cause !== undefined) {
      sanitizedCause = redactNonSerializable(cause);
    }

    super(message, { cause: sanitizedCause });

    this.code = code;
    this.description = meta.description;
    this.layer = meta.layer;
    this.name = this.constructor.name;
    this.originalCause = cause;
    this.retryable = meta.retryable;
    this.severity = meta.severity;

    const checked = isDev()
      ? validateAndMaybeSanitizeMetadata(metadata)
      : metadata;
    this.metadata = isDev()
      ? (deepFreezeDev(checked) as ErrorMetadata)
      : (Object.freeze(checked) as ErrorMetadata);

    try {
      Object.freeze(this);
    } catch {
      /* silent */
    }
  }

  static isAppError(val: unknown): val is AppError {
    return val instanceof AppError;
  }

  static from(error: unknown, fallbackCode: AppErrorKey): AppError {
    if (error instanceof AppError) {
      return error;
    }
    if (error instanceof Error) {
      return new AppError(fallbackCode, {
        cause: error,
        message: error.message,
        metadata: {},
      });
    }
    return new AppError(fallbackCode, {
      message: safeStringifyUnknown(error),
      metadata: buildUnknownValueMetadata(error),
    });
  }

  toJson(): AppErrorJson {
    return {
      code: this.code,
      description: this.description,
      layer: this.layer,
      message: this.message,
      metadata: this.metadata,
      retryable: this.retryable,
      severity: this.severity,
    };
  }
}
