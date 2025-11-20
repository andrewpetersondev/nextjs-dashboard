// src/shared/errors/pg-error.extractor.ts
import { PG_CODE_TO_META, type PgCode } from "@/shared/errors/pg-error-codes";

/**
 * Normalized Postgres error metadata extracted from pg error objects.
 */
export interface PgErrorMetadata {
  readonly code: PgCode;
  readonly column?: string;
  readonly constraint?: string;
  readonly datatype?: string;
  readonly detail?: string;
  readonly hint?: string;
  readonly position?: string;
  readonly schema?: string;
  readonly severity?: string;
  readonly table?: string;
  readonly where?: string;
}

/**
 * Safely extract Postgres error metadata from unknown error value.
 * Returns undefined if not a recognizable Postgres error.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <61 of 15>
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <ignore for now>
export function extractPgErrorMetadata(
  err: unknown,
): PgErrorMetadata | undefined {
  if (!err || typeof err !== "object") {
    return;
  }

  // Some libraries (Drizzle, pg, data-layer wrappers) may wrap the original
  // DatabaseError into `cause` or another nested property. We try a small
  // breadth-first scan over a few common containers to find the pg error-like
  // object that actually carries the `code` and its metadata.
  const queue: Record<string, unknown>[] = [err as Record<string, unknown>];

  const seen = new Set<object>();
  while (queue.length > 0) {
    const candidate = queue.shift()!;
    if (seen.has(candidate)) {
      // biome-ignore lint/nursery/noContinue: <nursery rule>
      continue;
    }
    seen.add(candidate);

    // Require a known Postgres error code
    if (typeof candidate.code === "string") {
      const codeString = candidate.code as string;
      if (codeString in PG_CODE_TO_META) {
        const code = codeString as PgCode;
        return {
          code,
          column:
            typeof candidate.column === "string" ? candidate.column : undefined,
          constraint:
            typeof candidate.constraint === "string"
              ? candidate.constraint
              : undefined,
          datatype:
            typeof candidate.datatype === "string"
              ? candidate.datatype
              : undefined,
          detail:
            typeof candidate.detail === "string" ? candidate.detail : undefined,
          hint: typeof candidate.hint === "string" ? candidate.hint : undefined,
          position:
            typeof candidate.position === "string"
              ? candidate.position
              : undefined,
          schema:
            typeof candidate.schema === "string" ? candidate.schema : undefined,
          severity:
            typeof candidate.severity === "string"
              ? candidate.severity
              : undefined,
          table:
            typeof candidate.table === "string" ? candidate.table : undefined,
          where:
            typeof candidate.where === "string" ? candidate.where : undefined,
        };
      }
    }

    // Explore a limited set of likely nested containers
    const next: unknown[] = [];
    if (candidate.cause && typeof candidate.cause === "object") {
      next.push(candidate.cause);
    }
    if (
      candidate.originalError &&
      typeof candidate.originalError === "object"
    ) {
      next.push(candidate.originalError);
    }
    if (candidate.error && typeof candidate.error === "object") {
      next.push(candidate.error);
    }
    // Add discovered objects to queue (up to a small limit implicitly by structure)
    for (const n of next) {
      queue.push(n as Record<string, unknown>);
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
