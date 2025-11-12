import "server-only";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import type { BaseError } from "@/shared/core/errors/base/base-error";
import { ConflictError } from "@/shared/core/errors/domain/domain-errors";

/**
 * Map a normalized BaseError to a more specific error subclass.
 * Extend as needed for your domain or cross-cutting infra errors.
 * All thrown errors from DAL are guaranteed to be mapped.
 */
export function mapBaseErrorToInfrastructureOrDomain(
  err: BaseError,
): ConflictError | DatabaseError {
  switch (err.code) {
    case "conflict":
      return new ConflictError(err.message, err.context, err.originalCause);
    // Expand for more domain codes as needed
    case "database":
      return new DatabaseError(err.message, err.context, err.originalCause);
    default:
      return new DatabaseError(err.message, err.context, err.originalCause);
  }
}
