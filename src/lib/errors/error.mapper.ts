import "server-only";

import {
  DatabaseError_New,
  ValidationError_New,
} from "@/lib/errors/domain.error";
import { INVOICE_ERROR_MESSAGES } from "@/lib/errors/error-messages";

/**
 * Repository-safe error union for Result-based methods.
 * Keep this central to avoid inference widening to unknown.
 */
export type RepoError = ValidationError_New | DatabaseError_New;

/**
 * Normalize unknown errors into repository/domain errors.
 * - Passes through known ValidationError_New and DatabaseError_New as-is
 * - Wraps unknown errors in DatabaseError_New with a structured cause
 */
export function mapToRepoError(e: unknown): RepoError {
  if (e instanceof ValidationError_New) return e;
  if (e instanceof DatabaseError_New) return e;

  // Attach the original unknown error as cause in a typed context object
  return new DatabaseError_New(INVOICE_ERROR_MESSAGES.DB_ERROR, { cause: e });
}
