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
 * Convenience factory for validation errors with form metadata.
 */
export function makeValidationError(options: AppErrorOptions = {}): AppError {
  return makeAppError("validation", options);
}

/**
 * Convenience factory for unexpected errors.
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
