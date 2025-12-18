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
 * Converts an arbitrary unknown error into an AppError using a fallback code.
 *
 * @remarks
 * Ensures all errors are normalized to AppError for consistent handling,
 * preserving metadata where possible. Use at boundaries to wrap external errors.
 */
export function makeAppErrorFromUnknown(
  error: unknown,
  fallbackCode: AppErrorKey,
): AppError {
  return AppError.from(error, fallbackCode);
}

/**
 * Creates a new AppError with the specified code and options.
 *
 * @remarks
 * Base factory for constructing domain-friendly errors. Ensures stable codes
 * and metadata for classification without subclasses.
 */
export function makeAppError(
  code: AppErrorKey,
  options: AppErrorOptions,
): AppError {
  return new AppError(code, options);
}

/**
 * Wraps an unknown error as an unexpected AppError, merging metadata.
 *
 * @remarks
 * For handling programmer errors or invariants—typically thrown, not returned
 * as Result, to signal unrecoverable states.
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
 * Creates a validation-specific AppError.
 *
 * @remarks
 * Convenience for expected failures like form or schema validation. Attach
 * field/form errors in metadata for UI handling.
 */
export function makeValidationError(options: AppErrorOptions): AppError {
  return makeAppError(APP_ERROR_KEYS.validation, options);
}

/**
 * Creates an infrastructure-specific AppError.
 *
 * @remarks
 * For expected technical issues (e.g., network, config) at adapter layers.
 * Normalize and return as Result.Err to treat as values.
 */
export function makeInfrastructureError(options: AppErrorOptions): AppError {
  return makeAppError(APP_ERROR_KEYS.infrastructure, options);
}

/**
 * Creates a database-specific AppError with required metadata.
 *
 * @remarks
 * For DB failures like queries or constraints. Use with normalization utils
 * (e.g., normalizePgError) to map vendor errors.
 */
export function makeDatabaseError(
  options: Omit<AppErrorOptions, "metadata"> & {
    metadata: DbErrorMetadata;
  },
): AppError {
  return makeAppError(APP_ERROR_KEYS.database, options);
}

/**
 * Creates an integrity-specific AppError.
 *
 * @remarks
 * For violations like duplicates or referential issues. Throw for unexpected
 * invariants; otherwise, return as Result.Err.
 */
export function makeIntegrityError(options: AppErrorOptions): AppError {
  return makeAppError(APP_ERROR_KEYS.integrity, options);
}
