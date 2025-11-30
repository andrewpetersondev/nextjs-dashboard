// src/shared/errors/db/normalizer.ts
import type { AppError } from "@/shared/errors/app-error";
import { mapPgError } from "@/shared/errors/db/mapper";
import type { DatabaseOperationMetadata } from "@/shared/errors/db/types";
import { makeAppError } from "@/shared/errors/factory";
import type { ErrorMetadata } from "@/shared/errors/types";

/**
 * Creates a specific AppError based on a successful Postgres mapping.
 */
function createMappedPgError(
  err: unknown,
  mapping: NonNullable<ReturnType<typeof mapPgError>>,
  additionalMetadata?: ErrorMetadata & Partial<DatabaseOperationMetadata>,
): AppError {
  return makeAppError(mapping.appCode, {
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
): AppError {
  return makeAppError("database", {
    cause: err,
    message: "db_unknown_error",
    metadata: additionalMetadata,
  });
}

/**
 * Normalize a Postgres error into a AppError with rich metadata.
 *
 * Preserves all Postgres metadata while mapping to appropriate app error code.
 * If not a Postgres error, returns a generic database error.
 */
export function normalizePgError(
  err: unknown,
  additionalMetadata?: ErrorMetadata & Partial<DatabaseOperationMetadata>,
): AppError {
  const mapping = mapPgError(err);

  if (mapping) {
    return createMappedPgError(err, mapping, additionalMetadata);
  }

  return createGenericDbError(err, additionalMetadata);
}
