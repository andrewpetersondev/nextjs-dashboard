import "server-only";

import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { PG_CONDITIONS } from "@/shared/errors/server/adapters/postgres/pg-conditions";
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
 *
 * Do NOT use `normalizeUnknownToAppError` for PG errors, or you will
 * lose `pgCode`/constraint metadata and condition mapping. The generic
 * normalizer is intended for non-PG integrations (HTTP, FS, etc.).
 *
 * @remarks
 * This utility enforces strict separation between:
 * 1. **Intrinsic Metadata**: Data extracted from the DB error object itself
 *    (constraints, codes, hints, severity).
 * 2. **Operational Context**: Caller-provided data for logging and tracing
 *    (operation name, entity) that must stay outside `AppError.metadata`.
 *
 * Intrinsic metadata only is attached to the error; operational context must
 * be passed to logging separately by the DAL wrapper.
 *
 * @param err - The raw error caught from the Postgres driver.
 */
export function normalizePgError(err: unknown): AppError {
  const cause = normalizePgCause(err);
  const mapping = toPgError(err);

  if (mapping) {
    return makeAppError(mapping.appCode, {
      cause,
      message: mapping.condition,
      metadata: {
        // Intrinsic PG metadata (pgCode, constraint, etc.)
        ...mapping.metadata,
      },
    });
  }

  return makeAppError(APP_ERROR_KEYS.unknown, {
    cause,
    message: PG_CONDITIONS.pg_unknown_error,
    metadata: {},
  });
}
