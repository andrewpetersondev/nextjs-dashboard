import "server-only";

import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { APP_ERROR_SEVERITY } from "@/shared/errors/core/app-error.severity";
import {
  PG_CODE_TO_META,
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
 * 2. Find first candidate with a known PG 'code'
 * 3. Extract metadata and map to AppError requirements
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
          appCode: definition.appCode,
          condition: definition.condition,
          metadata: extractPgMetadata(candidate, pgCode),
        };
      }
    }
  }

  // Fallback for non-PG errors or invalid inputs
  return {
    appCode: APP_ERROR_KEYS.unexpected,
    condition: PG_CONDITIONS.pg_unexpected_error,
    metadata: {
      detail: err instanceof Error ? err.message : String(err),
      pgCode: "criticalfuckup",
      severity: APP_ERROR_SEVERITY.ERROR,
    },
  };
}
