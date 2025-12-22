import type { PgErrorMetadata } from "@/shared/errors/adapters/postgres/pg-error.metadata";

/**
 * Type guard for narrowing unknown metadata to {@link PgErrorMetadata}.
 *
 * @remarks
 * This checks for a structurally valid Postgres metadata object:
 * - required: `pgCode` (non-empty string)
 * - optional: all other known PG metadata fields, when present, must be strings.
 *
 * Intended to be used at boundaries that receive generic `ErrorMetadata`
 * and need to branch on Postgres-specific information.
 */
export function isPgErrorMetadata(value: unknown): value is PgErrorMetadata {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PgErrorMetadata>;

  if (typeof candidate.pgCode !== "string" || candidate.pgCode.length === 0) {
    return false;
  }

  const optionalStringProps: (keyof PgErrorMetadata)[] = [
    "column",
    "constraint",
    "datatype",
    "detail",
    "hint",
    "position",
    "schema",
    "severity",
    "table",
    "where",
  ];

  for (const key of optionalStringProps) {
    const current = candidate[key];

    if (current !== undefined && typeof current !== "string") {
      return false;
    }
  }

  return true;
}
