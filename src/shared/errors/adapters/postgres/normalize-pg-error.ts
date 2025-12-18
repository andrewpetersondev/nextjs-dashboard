import type { PgOperationMetadata } from "@/shared/errors/adapters/postgres/pg-types";
import { toPgError } from "@/shared/errors/adapters/postgres/to-pg-error";
import { PG_CONDITIONS } from "@/shared/errors/catalog/pg-conditions";
import type { AppError } from "@/shared/errors/core/app-error";
import type { ErrorMetadata } from "@/shared/errors/core/app-error.types";
import {
  makeAppError,
  makeDatabaseError,
} from "@/shared/errors/factories/app-error.factory";

/**
 * Builds an AppError from a mapped Postgres error, merging metadata.
 *
 * @remarks
 * Used internally to create specific errors (e.g., integrity violations)
 * with preserved PG details for diagnostics.
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
 * Builds a fallback AppError for unmapped or non-Postgres errors.
 *
 * @remarks
 * Ensures all failures are wrapped as database errors, preventing raw
 * errors from propagating. Adds context for logging/tracing.
 */
function createGenericDbError(
  err: unknown,
  additionalMetadata?: ErrorMetadata & Partial<PgOperationMetadata>,
): AppError {
  return makeDatabaseError({
    cause: err,
    message: PG_CONDITIONS.pg_unknown_error,
    metadata: { ...(additionalMetadata ?? {}) },
  });
}

/**
 * Normalizes any error to an AppError, extracting Postgres metadata if present.
 *
 * @remarks
 * Adapter-layer utility for DALs: Maps PG codes to app codes, preserves details
 * like constraints/tables for expected failures (e.g., unique violations).
 * Use in try-catch to treat DB issues as values via Result.
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
