import { PG_CODE_TO_META, type PgCode } from "@/shared/errors/postgres/codes";
import { extractPgErrorMetadata } from "@/shared/errors/postgres/extractor";
import type { PgErrorMapping } from "@/shared/errors/postgres/types";
import type { AppErrorKey } from "@/shared/errors/registry";

/**
 * Map a Postgres error to app error code + rich metadata.
 *
 * Pipeline:
 * 1. Extract Postgres metadata
 * 2. Map pg code → app code via PG_CODE_TO_META
 * 3. Return normalized mapping ready for AppError construction
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
