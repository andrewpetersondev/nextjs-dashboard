// src/shared/errors/pg-error.mapper.ts
import type {
  ErrorContext,
  JsonObject,
  JsonValue,
} from "@/shared/errors/base-error.types";
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
 * Mapping result from Postgres error to app error code + context.
 */
export interface PgErrorMapping {
  readonly condition: PgErrorMeta["condition"];
  readonly context: ErrorContext;
  readonly pgMetadata: PgErrorMetadata;
}

/**
 * Map a Postgres error to app error code + rich context.
 *
 * Pipeline:
 * 1. Extract Postgres metadata
 * 2. Map pg code → app code via PG_CODE_TO_META
 * 3. Build rich context with pg metadata + constraint details
 * 4. Return normalized mapping ready for BaseError construction
 */
export function mapPgError(err: unknown): PgErrorMapping | undefined {
  const pgErrorMetadata = extractPgErrorMetadata(err);
  if (!pgErrorMetadata) {
    return;
  }

  const code: PgCode = pgErrorMetadata.code;
  const pgErrorDef = PG_CODE_TO_META[code];

  // Build JSON-safe context
  const contextEntries: [string, JsonValue][] = [["pgCode", code]];

  if (pgErrorMetadata.constraint) {
    contextEntries.push(["constraint", pgErrorMetadata.constraint]);
  }
  if (pgErrorMetadata.detail) {
    contextEntries.push(["pgDetail", pgErrorMetadata.detail]);
  }
  if (pgErrorMetadata.hint) {
    contextEntries.push(["pgHint", pgErrorMetadata.hint]);
  }
  if (pgErrorMetadata.severity) {
    contextEntries.push(["pgSeverity", pgErrorMetadata.severity]);
  }
  if (pgErrorMetadata.table) {
    contextEntries.push(["table", pgErrorMetadata.table]);
  }
  if (pgErrorMetadata.schema) {
    contextEntries.push(["schema", pgErrorMetadata.schema]);
  }
  if (pgErrorMetadata.column) {
    contextEntries.push(["column", pgErrorMetadata.column]);
  }
  if (pgErrorMetadata.where) {
    contextEntries.push(["where", pgErrorMetadata.where]);
  }

  const jsonContext = Object.freeze(
    Object.fromEntries(contextEntries) as JsonObject,
  );

  const context: ErrorContext = jsonContext;

  // Infrastructure-safe message; domain can override if needed
  const condition = pgErrorDef.condition ?? "Database operation failed";

  return {
    condition,
    context,
    pgMetadata: pgErrorMetadata,
  };
}
