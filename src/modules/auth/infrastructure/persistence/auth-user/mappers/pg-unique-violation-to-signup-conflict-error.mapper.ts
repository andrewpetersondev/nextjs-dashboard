import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { isPgMetadata } from "@/shared/errors/metadata/error-metadata.value";
import { PG_CODES } from "@/shared/errors/server/adapters/postgres/pg-codes";

/**
 * Maps a Postgres unique violation error to a domain-specific signup conflict error.
 * Inspects the error metadata to identify which field (email or username) caused the violation.
 *
 * @param error - The original `AppError` to map.
 * @returns A new `AppError` with conflict details, or `null` if the error is not a unique violation.
 */
export function pgUniqueViolationToSignupConflictError(
  error: AppError,
): AppError | null {
  if (error.key !== APP_ERROR_KEYS.integrity || !isPgMetadata(error.metadata)) {
    return null;
  }

  // TODO: fallback is not ideal
  //    const { constraint } = error.metadata;
  //    if (!constraint) {
  //        return null;
  //    }
  const constraint = error.metadata.constraint ?? "";

  const fieldErrors: Record<string, string[]> = {};

  if (constraint.includes("email")) {
    fieldErrors.email = ["alreadyInUse"];
  }

  if (constraint.includes("username")) {
    fieldErrors.username = ["alreadyInUse"];
  }

  if (Object.keys(fieldErrors).length === 0) {
    return null;
  }

  return makeAppError(APP_ERROR_KEYS.conflict, {
    cause: error,
    message: "Signup failed: value already in use",
    metadata: {
      pgCode: PG_CODES.UNIQUE_VIOLATION,
    },
  });
}
