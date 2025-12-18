import type { AppError } from "@/shared/errors/core/app-error";
import type { DatabaseErrorMetadata } from "@/shared/errors/core/app-error-metadata.types";

/**
 * Type guard to check if error metadata contains Postgres-specific information.
 *
 * @example
 * if (hasPgMetadata(error)) {
 *   console.log(error.metadata.constraint); // string | undefined
 * }
 */
export function hasPgMetadata(
  error: AppError,
): error is AppError & { metadata: DatabaseErrorMetadata } {
  return (
    error.metadata !== undefined &&
    ("pgCode" in error.metadata ||
      "constraint" in error.metadata ||
      "table" in error.metadata)
  );
}

/**
 * Type guard to check if error is database-related.
 * Relies on the error layer being "DB".
 */
export function isDatabaseError(
  error: AppError,
): error is AppError & { metadata: DatabaseErrorMetadata } {
  return error.layer === "DB";
}
