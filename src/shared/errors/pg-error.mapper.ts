// src/shared/errors/pg-error.mapper.ts
import {
  extractPgErrorMetadata,
  type PgErrorMetadata,
} from "@/shared/errors/pg-error.extractor";
import {
  PG_CODE_TO_META,
  type PgCode,
  type PgErrorMeta,
} from "@/shared/errors/pg-error-codes";

/**
 * Mapping result from Postgres error to app error code + metadata.
 */
export interface PgErrorMapping {
  readonly condition: PgErrorMeta["condition"];
  readonly pgMetadata: PgErrorMetadata;
}

/**
 * Map a Postgres error to app error code + rich metadata.
 *
 * Pipeline:
 * 1. Extract Postgres metadata
 * 2. Map pg code → app code via PG_CODE_TO_META
 * 3. Return normalized mapping ready for BaseError construction
 */
export function mapPgError(err: unknown): PgErrorMapping | undefined {
  const pgErrorMetadata = extractPgErrorMetadata(err);
  if (!pgErrorMetadata) {
    return;
  }

  const code: PgCode = pgErrorMetadata.code;
  const pgErrorDef = PG_CODE_TO_META[code];

  // Infrastructure-safe message; domain can override if needed
  const condition = pgErrorDef.condition ?? "db_unknown_error";

  return {
    condition,
    pgMetadata: pgErrorMetadata,
  };
}
