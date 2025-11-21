// src/shared/errors/pg-error.factory.ts
import type { BaseError } from "@/shared/errors/core/base-error";
import { makeBaseError } from "@/shared/errors/core/base-error.factory";
import type { ErrorContext } from "@/shared/errors/core/base-error.types";
import type { PgErrorMetadata } from "@/shared/errors/infra/pg-error.extractor";
import { mapPgError } from "@/shared/errors/infra/pg-error.mapper";

/**
 * Optional, high-level DB operation context supplied by callers.
 *
 * This describes *what* operation was being performed at the infrastructure
 * boundary (e.g. "insertUser", "updateProfileEmail"), and optionally which
 * table/entity was involved.
 *
 * @remarks - This not being used but may be in the future.
 */
interface _DatabaseOperationContext {
  // TODO: OPERATION DOES NOT APPEAR IN THE ERROR MAPPING. MAYBE IT IS REDACTED OR OVERWRITTEN?
  readonly operation?: string;
  readonly table?: string;
  readonly entity?: string;
}

/**
 * Canonical context shape for Postgres / DB infra errors.
 *
 * - Always includes any discovered Postgres metadata (PgErrorMetadata)
 * - May include higher-level database operation context from callers
 *
 * @remarks - This not being used but may be in the future.
 */
type _PgErrorContext = PgErrorMetadata & Partial<_DatabaseOperationContext>;

/**
 * Normalize a Postgres error into a BaseError with rich context.
 *
 * Preserves all Postgres metadata while mapping to appropriate app error code.
 * If not a Postgres error, returns a generic database error.
 */
export function normalizePgError(
  err: unknown,
  additionalContext?: ErrorContext,
): BaseError {
  const mapping = mapPgError(err);

  if (!mapping) {
    // Not a Postgres error - fallback to generic database error
    return makeBaseError("database", {
      cause: err,
      context: additionalContext,
      message: "unknown",
    });
  }

  return makeBaseError("database", {
    cause: err,
    context: {
      ...(additionalContext ?? {}),
      ...mapping.pgMetadata,
    },
    message: mapping.condition,
  });
}
