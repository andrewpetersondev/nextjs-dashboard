import "server-only";

import { PG_CONDITIONS } from "@/server/db/errors/postgres/pg-conditions";
import { toPgError } from "@/server/db/errors/postgres/to-pg-error";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error";

import type { DbOperationMetadata } from "@/shared/errors/core/db-operation.metadata";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

/**
 * Normalizes a raw Postgres error into a structured AppError.
 *
 *  Use only at Postgres boundaries.
 *
 * Do NOT use `normalizeUnknownToAppError` for PG errors, or you will
 * lose `pgCode`/constraint metadata and condition mapping. The generic
 * normalizer is intended for non-PG integrations (HTTP, FS, etc.).
 *
 * @remarks
 * This utility ensures strict separation between:
 * 1. **Intrinsic Metadata**: Data extracted from the DB error object itself
 *    (constraints, codes, hints, severity).
 * 2. **Operational Context**: Caller-provided data for logging and tracing
 *    (operation name, entity).
 *
 * The two metadata sets are merged but **never overlap** due to disjoint
 * key spaces:
 * - `DbOperationMetadata`: `operation`, `entity`
 * - `PgErrorMetadata`: `pgCode`, `constraint`, `table`, `column`, etc.
 *
 * **Required Parameter**: `operationalContext` must be provided by the DAL
 * wrapper to ensure all errors have traceability context.
 *
 * **Fallback Behavior**: If the error cannot be mapped to a known Postgres
 * code, it's treated as an unknown infrastructure error since we have no
 * intrinsic DB metadata to attach (note the absence of `pgCode` in metadata).
 *
 * @param err - The raw error caught from the Postgres driver.
 * @param operationalContext - Caller-provided operational context (required).
 */
export function normalizePgError(
  err: unknown,
  operationalContext: DbOperationMetadata,
): AppError {
  const mapping = toPgError(err);

  if (mapping) {
    return makeAppError(mapping.appCode, {
      cause: err,
      message: mapping.condition,
      metadata: {
        // Intrinsic PG metadata (pgCode, constraint, etc.)
        ...mapping.metadata,
        // Caller-provided context (operation, entity)
        ...operationalContext,
      },
    });
  }

  // Fallback: unrecognized error from DB layer.
  // Since we have no intrinsic DB metadata (no pgCode), treat as unknown
  // infrastructure error and only attach the operational context.
  return makeAppError(APP_ERROR_KEYS.unknown, {
    cause: err,
    message: PG_CONDITIONS.pg_unknown_error,
    metadata: {
      ...operationalContext,
    },
  });
}
