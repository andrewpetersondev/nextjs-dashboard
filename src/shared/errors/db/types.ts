// src/shared/errors/db/types.ts
import type { PgCode, PgErrorMeta } from "@/shared/errors/db/codes";
import type { AppErrorKey } from "@/shared/errors/registry";

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
 * Mapping result from Postgres error to app error code + metadata.
 */
export interface PgErrorMapping {
  readonly condition: PgErrorMeta["condition"];
  readonly appCode: AppErrorKey;
  readonly pgMetadata: PgErrorMetadata;
}

/**
 * Optional, high-level DB operation metadata supplied by callers.
 *
 * This describes *what* operation was being performed at the infrastructure
 * boundary (e.g. "insertUser", "updateProfileEmail"), and optionally which
 * table/entity was involved.
 */
export interface DatabaseOperationMetadata {
  readonly operation?: string;
  readonly table?: string;
  readonly entity?: string;
}
