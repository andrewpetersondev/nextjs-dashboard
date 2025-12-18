import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import { AppError } from "@/shared/errors/core/app-error";
import type {
  AppErrorOptions,
  ErrorMetadata,
} from "@/shared/errors/core/app-error.types";
import type { DatabaseErrorMetadata } from "@/shared/errors/core/app-error-metadata.types";

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
 * Keep this as the recommended catch-block helper.
 */
export function makeUnexpectedErrorFromUnknown(
  error: unknown,
  options: Omit<AppErrorOptions, "cause"> &
    Partial<Pick<AppErrorOptions, "message">> & {
      readonly metadata?: ErrorMetadata;
    },
): AppError {
  const base = makeAppErrorFromUnknown(error, "unexpected");

  return makeAppError("unexpected", {
    cause: base.originalCause,
    message: options.message ?? base.message,
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
  return makeAppError("validation", options);
}

/**
 * Convenience factory for unexpected errors.
 */
export function makeUnexpectedError(options: AppErrorOptions): AppError {
  return makeAppError("unexpected", options);
}

/**
 * Convenience factory for invariant violations.
 */
export function makeInvariantError(
  message: string,
  metadata: Record<string, unknown> = {},
): AppError {
  return makeAppError("unexpected", {
    message: `Invariant failed: ${message}`,
    metadata: { ...metadata, kind: "invariant" },
  });
}

/**
 * Convenience factory for infrastructure errors.
 */
export function makeInfrastructureError(options: AppErrorOptions): AppError {
  return makeAppError("infrastructure", options);
}

/**
 * Convenience factory for database errors.
 */
export function makeDatabaseError(
  options: Omit<AppErrorOptions, "metadata"> & {
    metadata: DatabaseErrorMetadata;
  },
): AppError {
  return makeAppError("database", options);
}

/**
 * Convenience factory for integrity errors.
 */
export function makeIntegrityError(options: AppErrorOptions): AppError {
  return makeAppError("integrity", options);
}
