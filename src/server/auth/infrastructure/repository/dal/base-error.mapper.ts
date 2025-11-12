import "server-only";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import type { BaseError } from "@/shared/core/errors/base/base-error";
import { ConflictError } from "@/shared/core/errors/domain/domain-errors";

/**
 * Map a normalized BaseError to a richer, specific error subclass.
 * Expand this mapping as needed for your domain!
 */
export function mapBaseErrorToInfrastructureOrDomain(
  err: BaseError,
): ConflictError | DatabaseError {
  // Strongly prefer code for mapping (class might only be BaseError)
  switch (err.code) {
    case "conflict":
      return new ConflictError(err.message, err.context, err.originalCause);
    case "database":
      return new DatabaseError(err.message, err.context, err.originalCause);
    default:
      return new DatabaseError(err.message, err.context, err.originalCause);
  }
}
