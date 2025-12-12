import { AppError } from "@/shared/errors/core/app-error.class";
import type {
  AppErrorOptions,
  DatabaseErrorMetadata,
} from "@/shared/errors/core/error.types";
import type { AppErrorKey } from "@/shared/errors/registries/error-code.registry";

/**
 * Canonical factory for creating `AppError` instances.
 */
export function makeAppError(
  code: AppErrorKey,
  options: AppErrorOptions = {},
): AppError {
  return new AppError(code, options);
}

/**
 * Normalize an unknown value into a AppError using {@link AppError.from}.
 *
 * This is the preferred entry-point for converting arbitrary thrown values
 * into the canonical `AppError` type.
 */
export function makeAppErrorFromUnknown(
  error: unknown,
  fallbackCode: AppErrorKey = "unknown",
): AppError {
  return AppError.from(error, fallbackCode);
}

/**
 * Normalize an unknown value into an `unexpected` AppError.
 *
 * Use this in `catch` blocks when you want to preserve the thrown value as cause,
 * while still tagging it with the canonical `unexpected` error code.
 */
export function makeUnexpectedErrorFromUnknown(
  error: unknown,
  options: Omit<AppErrorOptions, "cause" | "message"> &
    Partial<Pick<AppErrorOptions, "message">> = {},
): AppError {
  const base = makeAppErrorFromUnknown(error, "unexpected");

  // If no overrides were provided, return the normalized error as-is.
  if (options.message === undefined && options.metadata === undefined) {
    return base;
  }

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
export function makeValidationError(options: AppErrorOptions = {}): AppError {
  return makeAppError("validation", options);
}

/**
 * Convenience factory for unexpected errors.
 *
 * Use this when you're *creating* an unexpected error (not normalizing a caught value).
 * If you're in a `catch (err)`, prefer `makeUnexpectedErrorFromUnknown(err, ...)`.
 */
export function makeUnexpectedError(options: AppErrorOptions = {}): AppError {
  return makeAppError("unexpected", options);
}

/**
 * Convenience factory for invariant violations.
 */
export function makeInvariantError(
  message: string,
  metadata?: Record<string, unknown>,
): AppError {
  return makeAppError("unexpected", {
    message: `Invariant failed: ${message}`,
    metadata: { ...metadata, kind: "invariant" },
  });
}

/**
 * Convenience factory for infrastructure errors.
 */
export function makeInfrastructureError(
  options: AppErrorOptions = {},
): AppError {
  return makeAppError("infrastructure", options);
}

/**
 * Convenience factory for database errors.
 */
export function makeDatabaseError(
  options: AppErrorOptions & { metadata?: DatabaseErrorMetadata } = {},
): AppError {
  return makeAppError("database", options);
}

/**
 * Convenience factory for integrity errors.
 */
export function makeIntegrityError(options: AppErrorOptions = {}): AppError {
  return makeAppError("integrity", options);
}
