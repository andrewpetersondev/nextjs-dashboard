// src/shared/errors/pg-error.mapper.ts
import { extractPgErrorMetadata } from "@/shared/errors/pg-error.extractor";
import type { PgErrorMapping } from "@/shared/errors/pg-error.types";
import { PG_ERROR_MAP } from "@/shared/errors/pg-error-codes";

/**
 * Map a Postgres error to app error code + rich context.
 *
 * Pipeline:
 * 1. Extract Postgres metadata
 * 2. Map pg code → app code via PG_ERROR_MAP
 * 3. Build rich context with pg metadata + constraint details
 * 4. Return normalized mapping ready for BaseError construction
 */
export function mapPgError(err: unknown): PgErrorMapping | undefined {
  const pgMeta = extractPgErrorMetadata(err);
  if (!pgMeta) {
    return;
  }

  // Map pg code to app code (with fallback to 'database')
  const pgErrorDef = Object.values(PG_ERROR_MAP).find(
    (def) => def.code === pgMeta.code,
  );

  const appCode = "database";

  // Build rich context
  const context = {
    constraint: pgMeta.constraint,
    pgCode: pgMeta.code,
    pgDetail: pgMeta.detail,
    pgHint: pgMeta.hint,
    pgSeverity: pgMeta.severity,
    table: pgMeta.table,
  };

  // Generate user-safe message
  const message = pgErrorDef?.message ?? "Database operation failed";

  return {
    appCode,
    context,
    message,
    pgMetadata: pgMeta,
  };
}
