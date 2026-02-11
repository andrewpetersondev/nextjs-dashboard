import "server-only";

import {
  type AppError,
  isAppError,
} from "@/shared/core/errors/core/app-error.entity";
import { makeAppError } from "@/shared/core/errors/factories/app-error.factory";
import { toPgError } from "@/shared/core/errors/server/adapters/postgres/to-pg-error";

function normalizePgCause(err: unknown): AppError | Error | string {
  if (isAppError(err) || err instanceof Error || typeof err === "string") {
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
    metadata: mapping.pgErrorMetadata,
  });
}
