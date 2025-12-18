import { toPgError } from "@/shared/errors/adapters/postgres/to-pg-error";
import { PG_CONDITIONS } from "@/shared/errors/catalog/pg-conditions";
import type { AppError } from "@/shared/errors/core/app-error";
import type { DbOperationMetadata } from "@/shared/errors/core/app-error-metadata.types";
import {
  makeAppError,
  makeDatabaseError,
} from "@/shared/errors/factories/app-error.factory";

/**
 * Normalizes a raw Postgres error into a structured AppError.
 *
 * This utility ensures a strict separation between:
 * 1. **Intrinsic Metadata**: Data extracted from the DB error (constraints, codes).
 * 2. **Operational Context**: Caller-provided data for logging (operation name, identifiers).
 *
 * @param err - The raw error caught from the driver.
 * @param operationalContext - Data used for logging/tracing (e.g., `{ operation: 'createUser' }`).
 */
export function normalizePgError(
  err: unknown,
  operationalContext?: DbOperationMetadata,
): AppError {
  const mapping = toPgError(err);

  if (mapping) {
    return makeAppError(mapping.appCode, {
      cause: err,
      message: mapping.condition,
      metadata: {
        ...mapping.metadata,
        ...operationalContext, // Context is merged for logging visibility
      },
    });
  }

  return makeDatabaseError({
    cause: err,
    message: PG_CONDITIONS.pg_unknown_error,
    metadata: { ...operationalContext },
  });
}
