import "server-only";

import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { toPgError } from "@/shared/errors/server/adapters/postgres/to-pg-error";
import { isAppError } from "@/shared/errors/utils/is-app-error";

function normalizePgCause(err: unknown): AppError | Error | string {
  if (
    isAppError(err) ||
    err instanceof Error ||
    Error.isError(err) ||
    typeof err === "string"
  ) {
    return err;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/**
 * Normalizes a raw Postgres error into a structured AppError.
 *
 *  Use only at Postgres boundaries.
 */
export function normalizePgError(err: unknown): AppError {
  const cause = normalizePgCause(err);
  const mapping = toPgError(err);

  return makeAppError(mapping.appErrorKey, {
    cause,
    message: mapping.pgCondition,
    metadata: {
      ...mapping.pgErrorMetadata,
    },
  });
}
