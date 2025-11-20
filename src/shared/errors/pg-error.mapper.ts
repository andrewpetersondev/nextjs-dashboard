// src/shared/errors/pg-error.mapper.ts
import type {
  ErrorContext,
  JsonObject,
  JsonValue,
} from "@/shared/errors/base-error.types";
import { extractPgErrorMetadata } from "@/shared/errors/pg-error.extractor";
import type { PgErrorMapping } from "@/shared/errors/pg-error.types";
import { PG_CODE_TO_META, type PgCode } from "@/shared/errors/pg-error-codes";

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
  const pgMeta = extractPgErrorMetadata(err);
  if (!pgMeta) {
    return;
  }

  const code: PgCode = pgMeta.code;
  const pgErrorDef = PG_CODE_TO_META[code];

  // Build JSON-safe context
  const contextEntries: [string, JsonValue][] = [["pgCode", code]];

  if (pgMeta.constraint) {
    contextEntries.push(["constraint", pgMeta.constraint]);
  }
  if (pgMeta.detail) {
    contextEntries.push(["pgDetail", pgMeta.detail]);
  }
  if (pgMeta.hint) {
    contextEntries.push(["pgHint", pgMeta.hint]);
  }
  if (pgMeta.severity) {
    contextEntries.push(["pgSeverity", pgMeta.severity]);
  }
  if (pgMeta.table) {
    contextEntries.push(["table", pgMeta.table]);
  }
  if (pgMeta.schema) {
    contextEntries.push(["schema", pgMeta.schema]);
  }
  if (pgMeta.column) {
    contextEntries.push(["column", pgMeta.column]);
  }
  if (pgMeta.where) {
    contextEntries.push(["where", pgMeta.where]);
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
    pgMetadata: pgMeta,
  };
}
