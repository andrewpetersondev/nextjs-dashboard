import "server-only";

import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { APP_ERROR_SEVERITY } from "@/shared/errors/core/app-error.types";
import {
  PG_CODE_TO_META,
  PG_CODES,
  type PgCode,
} from "@/shared/errors/server/adapters/postgres/pg-codes";
import { PG_CONDITIONS } from "@/shared/errors/server/adapters/postgres/pg-conditions";
import type { PgErrorMapping } from "@/shared/errors/server/adapters/postgres/pg-error.metadata";
import {
  extractPgMetadata,
  flattenErrorChain,
} from "@/shared/errors/server/adapters/postgres/to-pg-error.utils";

/**
 * Transforms an unknown error into a mapped Postgres error definition.
 *
 * Pipeline:
 * 1. Flatten error chain (look through .cause)
 * 2. Find first candidate with a known PG 'pgCode'
 * 3. Extract pgErrorMetadata and map to AppError requirements
 * 4. Fallback to an internal error mapping if no match is found
 */
export function toPgError(err: unknown): PgErrorMapping {
  if (err && typeof err === "object") {
    const candidates = flattenErrorChain(err);

    for (const candidate of candidates) {
      const code = candidate.code;

      if (typeof code === "string" && code in PG_CODE_TO_META) {
        const pgCode = code as PgCode;
        const definition = PG_CODE_TO_META[pgCode];

        return {
          appErrorKey: definition.appErrorKey,
          pgCondition: definition.pgCondition,
          pgErrorMetadata: extractPgMetadata(candidate, pgCode),
        };
      }
    }
  }

  return {
    appErrorKey: APP_ERROR_KEYS.unexpected,
    pgCondition: PG_CONDITIONS.pg_unexpected_error,
    pgErrorMetadata: {
      detail: err instanceof Error ? err.message : String(err),
      pgCode: PG_CODES.UNEXPECTED_INTERNAL_ERROR,
      severity: APP_ERROR_SEVERITY.ERROR,
    },
  };
}
