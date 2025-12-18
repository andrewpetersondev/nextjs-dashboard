import {
  APP_ERROR_KEYS,
  type AppErrorKey,
} from "@/shared/errors/catalog/app-error.registry";
import { AppError } from "@/shared/errors/core/app-error";
import type {
  AppErrorOptions,
  ErrorMetadata,
} from "@/shared/errors/core/app-error.types";
import type { DbErrorMetadata } from "@/shared/errors/core/app-error-metadata.types";

/**
 * Canonical factory for creating `AppError` instances.
 *
 * No defaults: callers must choose message + metadata explicitly.
 */
export function makeAppError(
  code: AppErrorKey,
  options: AppErrorOptions,
): AppError {
  return new AppError(code, options);
}

/**
 * Normalize an unknown value into a AppError using {@link AppError.from}.
 *
 * No default fallback code: the caller must decide how to classify the unknown.
 */
export function makeAppErrorFromUnknown(
  error: unknown,
  fallbackCode: AppErrorKey,
): AppError {
  return AppError.from(error, fallbackCode);
}

/**
 * Normalize an unknown value into an `unexpected` AppError.
 *
 * @remarks
 * Intentionally does not default the message: callers must provide a condition key
 * to avoid silent fallbacks and configuration drift.
 */
export function makeUnexpectedErrorFromUnknown(
  error: unknown,
  options: Omit<AppErrorOptions, "cause"> & {
    readonly metadata?: ErrorMetadata;
  },
): AppError {
  const base = makeAppErrorFromUnknown(error, APP_ERROR_KEYS.unexpected);

  return makeAppError(APP_ERROR_KEYS.unexpected, {
    cause: base.originalCause,
    message: options.message,
    metadata: {
      ...base.metadata,
      ...(options.metadata ?? {}),
    },
  });
}

/**
 * Convenience factory for validation errors with form metadata.
 */
export function makeValidationError(options: AppErrorOptions): AppError {
  return makeAppError(APP_ERROR_KEYS.validation, options);
}

/**
 * Convenience factory for infrastructure errors.
 */
export function makeInfrastructureError(options: AppErrorOptions): AppError {
  return makeAppError(APP_ERROR_KEYS.infrastructure, options);
}

/**
 * Convenience factory for database errors.
 */
export function makeDatabaseError(
  options: Omit<AppErrorOptions, "metadata"> & {
    metadata: DbErrorMetadata;
  },
): AppError {
  return makeAppError(APP_ERROR_KEYS.database, options);
}

/**
 * Convenience factory for integrity errors.
 */
export function makeIntegrityError(options: AppErrorOptions): AppError {
  return makeAppError(APP_ERROR_KEYS.integrity, options);
}
