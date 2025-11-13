// src/server/auth/infrastructure/repository/errors/base-error.mapper.ts
import "server-only";
import {
  DatabaseError,
  InfrastructureError,
} from "@/server/errors/infrastructure-errors";
import type { BaseError } from "@/shared/core/errors/base/base-error";

/**
 * Map a normalized BaseError to a more specific infrastructure error subclass.
 * All thrown errors from DAL are guaranteed to be mapped.
 */
export function mapBaseErrorToInfrastructure(
  err: BaseError,
): DatabaseError | InfrastructureError {
  switch (err.code) {
    case "conflict":
    case "database":
      return new DatabaseError(err.message, err.context, err.originalCause);
    default:
      return new InfrastructureError(
        err.message,
        err.context,
        err.originalCause,
      );
  }
}
