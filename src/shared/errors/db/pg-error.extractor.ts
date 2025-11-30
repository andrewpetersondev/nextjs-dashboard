// src/shared/errors/infra/pg-error.extractor.ts
import type { PgErrorMetadata } from "@/shared/errors/db/pg-error.types";
import {
  PG_CODE_TO_META,
  type PgCode,
} from "@/shared/errors/db/pg-error-codes";

/**
 * BFS to flatten the error chain, looking into common wrapper properties.
 */
function flattenErrorChain(root: unknown): Record<string, unknown>[] {
  const queue: Record<string, unknown>[] = [root as Record<string, unknown>];
  const result: Record<string, unknown>[] = [];
  const seen = new Set<object>();
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (seen.has(current)) {
      continue;
    }
    seen.add(current);
    result.push(current);

    // Check common wrapper properties
    // We use a predefined list to avoid infinite recursion on arbitrary props
    const propsToCheck = ["cause", "originalError", "originalCause", "error"];
    for (const prop of propsToCheck) {
      const val = current[prop];
      if (val && typeof val === "object") {
        queue.push(val as Record<string, unknown>);
      }
    }
  }
  return result;
}

function extractMetadataFromObject(
  obj: Record<string, unknown>,
  code: PgCode,
): PgErrorMetadata {
  return {
    code,
    column: asString(obj.column),
    constraint: asString(obj.constraint),
    datatype: asString(obj.datatype),
    detail: asString(obj.detail),
    hint: asString(obj.hint),
    position: asString(obj.position),
    schema: asString(obj.schema),
    severity: asString(obj.severity),
    table: asString(obj.table),
    where: asString(obj.where),
  };
}

function asString(val: unknown): string | undefined {
  return typeof val === "string" ? val : undefined;
}

/**
 * Safely extract Postgres error metadata from unknown error value.
 * Returns undefined if not a recognizable Postgres error.
 */
export function extractPgErrorMetadata(
  err: unknown,
): PgErrorMetadata | undefined {
  if (!err || typeof err !== "object") {
    return;
  }

  // Flatten potential error wrappers to find the actual PG error
  const candidates = flattenErrorChain(err);

  for (const candidate of candidates) {
    const code = candidate.code;
    if (typeof code === "string" && code in PG_CODE_TO_META) {
      return extractMetadataFromObject(candidate, code as PgCode);
    }
  }

  return;
}

/**
 * Type guard for Postgres errors.
 */
export function isPgError(err: unknown): err is { code: PgCode } {
  return extractPgErrorMetadata(err) !== undefined;
}
