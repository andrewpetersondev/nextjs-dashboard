// src/shared/errors/infra/pg-error.normalizer.ts
import type { BaseError } from "@/shared/errors/core/base-error";
import { makeBaseError } from "@/shared/errors/core/factory";
import type { ErrorMetadata } from "@/shared/errors/core/base-error.types";
import { mapPgError } from "@/shared/errors/infra/pg-error.mapper";
import type { DatabaseOperationMetadata } from "@/shared/errors/infra/pg-error.types";

/**
 * Creates a specific BaseError based on a successful Postgres mapping.
 */
function createMappedPgError(
  err: unknown,
  mapping: NonNullable<ReturnType<typeof mapPgError>>,
  additionalMetadata?: ErrorMetadata & Partial<DatabaseOperationMetadata>,
): BaseError {
  return makeBaseError(mapping.appCode, {
    cause: err,
    message: mapping.condition,
    metadata: {
      ...(additionalMetadata ?? {}),
      ...mapping.pgMetadata,
    },
  });
}

/**
 * Creates a generic fallback database error when mapping fails.
 */
function createGenericDbError(
  err: unknown,
  additionalMetadata?: ErrorMetadata & Partial<DatabaseOperationMetadata>,
): BaseError {
  return makeBaseError("database", {
    cause: err,
    message: "db_unknown_error",
    metadata: additionalMetadata,
  });
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

  if (mapping) {
    return createMappedPgError(err, mapping, additionalMetadata);
  }

  return createGenericDbError(err, additionalMetadata);
}
