import {
  PG_CODE_TO_META,
  type PgCode,
} from "@/shared/errors/adapters/postgres/postgres.codes";
import type { PgErrorMapping } from "@/shared/errors/adapters/postgres/postgres-error.types";
import { extractPgErrorMetadata } from "@/shared/errors/adapters/postgres/postgres-metadata.extractor";
import type { AppErrorKey } from "@/shared/errors/registries/error-code.registry";

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

  const code: PgCode = pgErrorMetadata.pgCode;

  const pgErrorDef = PG_CODE_TO_META[code];

  const condition = pgErrorDef.condition ?? "db_unknown_error";

  const appCode: AppErrorKey = "integrity";

  return {
    appCode,
    condition,
    pgMetadata: pgErrorMetadata,
  };
}
