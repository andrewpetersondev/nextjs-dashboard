import "server-only";

import type { PgErrorMetadata } from "@/shared/core/errors/server/adapters/postgres/db-error.types";
import type { PgCode } from "@/shared/core/errors/server/adapters/postgres/pg-codes";

/**
 * Internal helper for error chain traversal.
 */
interface ErrorCandidate {
  readonly [key: string]: unknown;
  readonly code?: unknown;
}

/**
 * Extracts native Postgres fields from a raw error candidate.
 */
export function extractPgMetadata(
  obj: ErrorCandidate,
  code: PgCode,
): PgErrorMetadata {
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
export function flattenErrorChain(root: unknown): ErrorCandidate[] {
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
