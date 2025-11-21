// src/shared/errors/pg-error.factory.ts
import type { BaseError } from "@/shared/errors/core/base-error";
import { makeBaseError } from "@/shared/errors/core/base-error.factory";
import type { ErrorContext } from "@/shared/errors/core/base-error.types";
import { mapPgError } from "@/shared/errors/infra/pg-error.mapper";

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
      message: "Database operation failed",
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
