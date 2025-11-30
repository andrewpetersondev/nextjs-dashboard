// src/shared/errors/infra/pg-error.mapper.ts
import type { AppErrorKey } from "@/shared/errors/core/registry";
import { extractPgErrorMetadata } from "@/shared/errors/infra/pg-error.extractor";
import type { PgErrorMapping } from "@/shared/errors/infra/pg-error.types";
import {
  PG_CODE_TO_META,
  type PgCode,
} from "@/shared/errors/infra/pg-error-codes";

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
  // Known codes in PG_CODE_TO_META describe integrity violations
  const appCode: AppErrorKey = "integrity";

  return {
    appCode,
    condition,
    pgMetadata: pgErrorMetadata,
  };
}
