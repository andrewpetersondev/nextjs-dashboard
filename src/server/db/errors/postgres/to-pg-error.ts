import "server-only";

import {
  PG_CODE_TO_META,
  type PgCode,
} from "@/server/db/errors/postgres/pg-codes";
import type {
  PgErrorMapping,
  PgErrorMetadata,
} from "@/server/db/errors/postgres/pg-error.metadata";

/**
 * A object that might be part of an error chain.
 */
type ErrorCandidate = Record<string, unknown>;

/**
 * BFS to flatten the error chain, looking into common wrapper properties.
 *
 * @remarks
 * This is used primarily by adapters (like Postgres) to find the root cause
 * or specific technical metadata (like `code`) buried inside nested errors.
 *
 * It uses a Breadth-First Search to ensure shallow causes are processed first.
 *
 * @param root - The starting error value.
 * @returns An array of objects found in the chain, sorted by depth.
 */
function flattenErrorChain(root: unknown): ErrorCandidate[] {
  if (!root || typeof root !== "object") {
    return [];
  }

  const IterationLimit = 50;
  const result: ErrorCandidate[] = [];
  const seen = new Set<object>();
  const queue: ErrorCandidate[] = [root as ErrorCandidate];

  const propsToCheck = ["cause", "error", "originalCause", "originalError"];

  while (queue.length > 0 && result.length < IterationLimit) {
    const current = queue.shift();

    if (!current || seen.has(current)) {
      // biome-ignore lint/nursery/noContinue: <safe for now>
      continue;
    }

    seen.add(current);

    result.push(current);

    for (const prop of propsToCheck) {
      const val = current[prop];

      if (val && typeof val === "object") {
        queue.push(val as ErrorCandidate);
      }
    }
  }
  return result;
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
 * Transforms an unknown error into a mapped Postgres error definition.
 *
 * Pipeline:
 * 1. Flatten error chain (look through .cause)
 * 2. Find first candidate with a known PG 'code'
 * 3. Extract metadata and map to AppError requirements
 */
export function toPgError(err: unknown): PgErrorMapping | undefined {
  if (!err || typeof err !== "object") {
    return;
  }

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

  return;
}
