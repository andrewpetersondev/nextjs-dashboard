// src/shared/errors/pg-error.types.ts
import type { ErrorContext } from "@/shared/errors/base-error.types";

/**
 * Normalized Postgres error metadata extracted from pg error objects.
 */
export interface PgErrorMetadata {
  readonly code: string;
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
 * Mapping result from Postgres error to app error code + context.
 */
export interface PgErrorMapping {
  readonly appCode: "database";
  readonly context: ErrorContext;
  readonly message: string;
  readonly pgMetadata: PgErrorMetadata;
}
