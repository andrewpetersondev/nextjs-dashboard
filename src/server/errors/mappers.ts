import "server-only";

import { INVOICE_ERROR_MESSAGES } from "@/features/invoices/messages";
import { DatabaseError } from "@/server/errors/infrastructure";
import { ValidationError_New } from "@/shared/errors/domain";
import { Err, Ok, type Result } from "@/shared/result/result-base";

/**
 * Union type representing repository errors.
 *
 * Combines possible error types encountered in repository operations.
 *
 * @typeParam ValidationError_New - Represents validation-related errors.
 * @typeParam DatabaseError_New - Represents database-related errors.
 * @remarks
 * Discriminant keys and branch-specific shapes should be documented if needed.
 */
export type RepoError = ValidationError_New | DatabaseError;

/**
 * Map an unknown error to a repository-specific error.
 *
 * Ensures consistent error handling for repository logic.
 *
 * @param e - The unknown error to be mapped.
 * @returns A {@link RepoError}, retaining type if already a compatible error.
 */
export function mapToRepoError(e: unknown): RepoError {
  if (e instanceof ValidationError_New) {
    return e;
  }
  if (e instanceof DatabaseError) {
    return e;
  }

  // Attach the original unknown error as cause in a typed context object
  return new DatabaseError(INVOICE_ERROR_MESSAGES.DB_ERROR, { cause: e });
}

/**
 * Map a `ValidationError_New` to the same type within a Result.
 *
 * Legacy `ValidationError` has been removed; this is now a no-op mapper that
 * preserves the original error type.
 */
export const mapNewToLegacyError = <T>(
  r: Result<T, ValidationError_New>,
): Result<T, ValidationError_New> => (r.success ? Ok(r.data) : Err(r.error));
