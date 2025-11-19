// src/shared/errors/pg-error.extractor.ts
import type { PgErrorMetadata } from "@/shared/errors/pg-error.types";

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

  const candidate = err as Record<string, unknown>;

  // Check for Postgres error signature (code is required)
  if (typeof candidate.code !== "string") {
    return;
  }

  return {
    code: candidate.code,
    column: typeof candidate.column === "string" ? candidate.column : undefined,
    constraint:
      typeof candidate.constraint === "string"
        ? candidate.constraint
        : undefined,
    datatype:
      typeof candidate.datatype === "string" ? candidate.datatype : undefined,
    detail: typeof candidate.detail === "string" ? candidate.detail : undefined,
    hint: typeof candidate.hint === "string" ? candidate.hint : undefined,
    position:
      typeof candidate.position === "string" ? candidate.position : undefined,
    schema: typeof candidate.schema === "string" ? candidate.schema : undefined,
    severity:
      typeof candidate.severity === "string" ? candidate.severity : undefined,
    table: typeof candidate.table === "string" ? candidate.table : undefined,
    where: typeof candidate.where === "string" ? candidate.where : undefined,
  };
}

/**
 * Type guard for Postgres errors.
 */
export function isPgError(err: unknown): err is { code: string } {
  return extractPgErrorMetadata(err) !== undefined;
}
