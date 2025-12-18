import type { PgOperationMetadata } from "@/shared/errors/adapters/postgres/pg-types";
import { toPgError } from "@/shared/errors/adapters/postgres/to-pg-error";
import { CONDITIONS } from "@/shared/errors/catalog/conditions";
import type { AppError } from "@/shared/errors/core/app-error";
import type { ErrorMetadata } from "@/shared/errors/core/app-error.types";
import {
  makeAppError,
  makeDatabaseError,
} from "@/shared/errors/factories/app-error";

/**
 * Creates a specific AppError based on a successful Postgres mapping.
 */
function createMappedPgError(
  err: unknown,
  mapping: NonNullable<ReturnType<typeof toPgError>>,
  additionalMetadata?: ErrorMetadata & Partial<PgOperationMetadata>,
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
  additionalMetadata?: ErrorMetadata & Partial<PgOperationMetadata>,
): AppError {
  return makeDatabaseError({
    cause: err,
    message: CONDITIONS.db_unknown_error,
    metadata: { ...(additionalMetadata ?? {}) },
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
  additionalMetadata?: ErrorMetadata & Partial<PgOperationMetadata>,
): AppError {
  const mapping = toPgError(err);

  if (mapping) {
    return createMappedPgError(err, mapping, additionalMetadata);
  }

  return createGenericDbError(err, additionalMetadata);
}
