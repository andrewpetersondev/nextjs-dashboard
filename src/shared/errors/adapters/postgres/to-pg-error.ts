import {
  PG_CODE_TO_META,
  type PgCode,
  type PgErrorMeta,
} from "@/shared/errors/adapters/postgres/pg-codes";
import type { PgErrorMetadata } from "@/shared/errors/adapters/postgres/pg-error-metadata.types";
import { extractPgErrorMetadata } from "@/shared/errors/adapters/postgres/pg-metadata";
import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";

/**
 * Mapping result from Postgres error to app error code + metadata.
 */
interface PgErrorMapping {
  readonly appCode: AppErrorKey;
  readonly condition: PgErrorMeta["condition"];
  readonly pgMetadata: PgErrorMetadata;
}

/**
 * Map a Postgres error to app error code + rich metadata.
 *
 * Pipeline:
 * 1. Extract Postgres metadata
 * 2. Map pg code → app code via PG_CODE_TO_META
 * 3. Return normalized mapping ready for AppError construction
 */
export function toPgError(err: unknown): PgErrorMapping | undefined {
  const pgErrorMetadata = extractPgErrorMetadata(err);

  if (!pgErrorMetadata) {
    return;
  }

  const code: PgCode = pgErrorMetadata.pgCode;

  const pgErrorDef = PG_CODE_TO_META[code];

  return {
    appCode: pgErrorDef.appCode,
    condition: pgErrorDef.condition,
    pgMetadata: pgErrorMetadata,
  };
}
