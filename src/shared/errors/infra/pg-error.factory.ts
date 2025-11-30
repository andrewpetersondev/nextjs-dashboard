// src/shared/errors/infra/pg-error.factory.ts
import type { BaseError } from "@/shared/errors/core/base-error";
import { makeBaseError } from "@/shared/errors/core/base-error.factory";
import type { ErrorMetadata } from "@/shared/errors/core/base-error.types";
import { mapPgError } from "@/shared/errors/infra/pg-error.mapper";

/**
 * Optional, high-level DB operation metadata supplied by callers.
 *
 * This describes *what* operation was being performed at the infrastructure
 * boundary (e.g. "insertUser", "updateProfileEmail"), and optionally which
 * table/entity was involved.
 */
export interface DatabaseOperationMetadata {
  readonly operation?: string;
  readonly table?: string;
  readonly entity?: string;
}

/**
 * Normalize a Postgres error into a BaseError with rich metadata.
 *
 * Preserves all Postgres metadata while mapping to appropriate app error code.
 * If not a Postgres error, returns a generic database error.
 */
export function normalizePgError(
  err: unknown,
  additionalMetadata?: ErrorMetadata & Partial<DatabaseOperationMetadata>,
): BaseError {
  const mapping = mapPgError(err);

  if (!mapping) {
    // Not a Postgres error - fallback to generic database error
    return makeBaseError("database", {
      cause: err,
      message: "db_unknown_error",
      metadata: additionalMetadata,
    });
  }

  return makeBaseError(mapping.appCode, {
    cause: err,
    message: mapping.condition,
    metadata: {
      ...(additionalMetadata ?? {}),
      ...mapping.pgMetadata,
    },
  });
}
