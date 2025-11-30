import type {
  PgCode,
  PgErrorMeta,
} from "@/shared/errors/adapters/postgres/postgres.codes";
import type { AppErrorKey } from "@/shared/errors/registry/error-code.registry";

/**
 * Normalized Postgres error metadata extracted from pg error objects.
 */
export interface PgErrorMetadata {
  readonly pgCode: PgCode;
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
  readonly appCode: AppErrorKey;
  readonly condition: PgErrorMeta["condition"];
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
  readonly entity?: string;
  readonly operation?: string;
  readonly table?: string;
}
