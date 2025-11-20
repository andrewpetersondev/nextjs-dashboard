// src/shared/errors/pg-error.factory.ts
import { BaseError } from "@/shared/errors/base-error";
import type { ErrorContext } from "@/shared/errors/base-error.types";
import { mapPgError } from "@/shared/errors/pg-error.mapper";

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
    return new BaseError("database", {
      cause: err,
      context: additionalContext,
      message: "Database operation failed",
    });
  }

  return new BaseError(mapping.appCode, {
    cause: err,
    context: {
      ...(additionalContext ?? {}),
      ...mapping.context,
    },
    message: mapping.message,
  });
}
