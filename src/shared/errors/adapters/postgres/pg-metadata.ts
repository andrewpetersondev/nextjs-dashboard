import {
  PG_CODE_TO_META,
  type PgCode,
} from "@/shared/errors/adapters/postgres/pg-codes";
import type { PgErrorMetadata } from "@/shared/errors/adapters/postgres/pg-error-metadata.types";
import { flattenErrorChain } from "@/shared/errors/utils/error-chain";

function asString(val: unknown): string | undefined {
  return typeof val === "string" ? val : undefined;
}

function extractMetadataFromObject(
  obj: Record<string, unknown>,
  code: PgCode,
): PgErrorMetadata {
  return {
    column: asString(obj.column),
    constraint: asString(obj.constraint),
    datatype: asString(obj.datatype),
    detail: asString(obj.detail),
    hint: asString(obj.hint),
    pgCode: code, // Map 'code' to 'pgCode'
    position: asString(obj.position),
    schema: asString(obj.schema),
    severity: asString(obj.severity),
    table: asString(obj.table),
    where: asString(obj.where),
  };
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
