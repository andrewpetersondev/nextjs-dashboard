// src/server/auth/infrastructure/repository/errors/base-error.mapper.ts
import "server-only";
import type { BaseError } from "@/shared/core/errors/base/base-error";
import {
  DatabaseError,
  InfrastructureError,
} from "@/shared/core/errors/domain/base-error.subclasses";

/**
 * Map a normalized BaseError to an infrastructure-specific error subclass.
 *
 * DAL should not return domain errors; it only exposes infrastructure failures
 * (database / generic infra). Domain translation happens in higher layers
 * (repository/domain/application).
 */
export function mapBaseErrorToInfrastructure(
  err: BaseError,
): DatabaseError | InfrastructureError {
  switch (err.code) {
    case "database":
    case "conflict":
      return new DatabaseError(err.message, err.context, err.originalCause);
    default:
      return new InfrastructureError(
        err.message,
        err.context,
        err.originalCause,
      );
  }
}
