import "server-only";
import { Err, Ok, type Result } from "@/core/result-base";
import { ValidationError } from "@/errors/errors";
import { DatabaseError_New, ValidationError_New } from "@/errors/errors-domain";
import { INVOICE_ERROR_MESSAGES } from "@/errors/errors-messages";

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
export type RepoError = ValidationError_New | DatabaseError_New;

/**
 * Map an unknown error to a repository-specific error.
 *
 * Ensures consistent error handling for repository logic.
 *
 * @param e - The unknown error to be mapped.
 * @returns A {@link RepoError}, retaining type if already a compatible error.
 */
export function mapToRepoError(e: unknown): RepoError {
  if (e instanceof ValidationError_New) return e;
  if (e instanceof DatabaseError_New) return e;

  // Attach the original unknown error as cause in a typed context object
  return new DatabaseError_New(INVOICE_ERROR_MESSAGES.DB_ERROR, { cause: e });
}

/**
 * Map a `ValidationError_New` to a `ValidationError`.
 *
 * Transforms the error branch of a `Result` while preserving the success data.
 *
 * @typeParam T - Type of the success data.
 * @param r - Result containing either success data or `ValidationError_New`.
 * @returns `Result<T, ValidationError>` with mapped error on the error branch.
 */
export const mapNewToLegacyError = <T>(
  r: Result<T, ValidationError_New>,
): Result<T, ValidationError> =>
  r.success ? Ok(r.data) : Err(new ValidationError(r.error.message));
