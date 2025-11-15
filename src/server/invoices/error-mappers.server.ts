import "server-only";

import {
  DatabaseError,
  ValidationError,
} from "@/shared/errors/base-error.subclasses";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";

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
export type RepoError = ValidationError | DatabaseError;

/**
 * Map an unknown error to a repository-specific error.
 *
 * Ensures consistent error handling for repository logic.
 *
 * @param e - The unknown error to be mapped.
 * @returns A {@link RepoError}, retaining type if already a compatible error.
 */
export function mapToRepoError(e: unknown): RepoError {
  if (e instanceof ValidationError) {
    return e;
  }
  if (e instanceof DatabaseError) {
    return e;
  }

  // Attach the original unknown error as cause in a typed context object
  return new DatabaseError(INVOICE_MSG.dbError, { cause: e });
}
