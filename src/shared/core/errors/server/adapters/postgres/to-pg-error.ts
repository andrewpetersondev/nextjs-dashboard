import "server-only";
import { APP_ERROR_SEVERITY } from "@/shared/core/errors/core/app-error.dto";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import type { PgErrorMetadata } from "@/shared/core/errors/server/adapters/postgres/db-error.dto";
import {
  PG_CODE_TO_META,
  PG_CODES,
  PG_CONDITIONS,
  type PgCode,
} from "@/shared/core/errors/server/adapters/postgres/pg-error.constants";
import type { PgErrorMapping } from "@/shared/core/errors/server/adapters/postgres/pg-error.metadata";

/**
 * Internal helper for error chain traversal.
 */
interface ErrorCandidate {
  readonly code?: unknown;
  readonly [key: string]: unknown;
}

/**
 * Extracts native Postgres fields from a raw error candidate.
 */
function extractPgMetadata(obj: ErrorCandidate, code: PgCode): PgErrorMetadata {
  const asStr = (v: unknown): string | undefined =>
    typeof v === "string" ? v : undefined;

  return {
    column: asStr(obj.column),
    constraint: asStr(obj.constraint),
    datatype: asStr(obj.datatype),
    detail: asStr(obj.detail),
    hint: asStr(obj.hint),
    pgCode: code,
    position: asStr(obj.position),
    schema: asStr(obj.schema),
    severity: asStr(obj.severity),
    table: asStr(obj.table),
    where: asStr(obj.where),
  };
}

/**
 * BFS to flatten the error chain, looking into common wrapper properties.
 *
 * This is used primarily by adapters (like Postgres) to find the root cause
 * or specific technical pgErrorMetadata (like `pgCode`) buried inside nested errors.
 *
 * It uses a Breadth-First Search to ensure shallow causes are processed first.
 */
function flattenErrorChain(root: unknown): ErrorCandidate[] {
  if (!root || typeof root !== "object") {
    return [];
  }

  const ITERATION_LIMIT = 50;
  const PROPS_TO_CHECK = ["cause", "error", "originalCause", "originalError"];

  const queue: ErrorCandidate[] = [root as ErrorCandidate];
  const result: ErrorCandidate[] = [];
  const seen = new Set<object>();

  while (queue.length > 0 && result.length < ITERATION_LIMIT) {
    const current = queue.shift();

    if (!current || seen.has(current)) {
      // biome-ignore lint/nursery/noContinue: needed for BFS
      continue;
    }
    seen.add(current);
    result.push(current);

    for (const prop of PROPS_TO_CHECK) {
      const val = current[prop];
      if (val && typeof val === "object") {
        queue.push(val as ErrorCandidate);
      }
    }
  }
  return result;
}

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
