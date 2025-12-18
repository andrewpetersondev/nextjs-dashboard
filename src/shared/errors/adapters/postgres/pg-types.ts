import type {
  PgCode,
  PgErrorMeta,
} from "@/shared/errors/adapters/postgres/pg-codes";
import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type {
  DbOperationMetadata,
  PgErrorMetadataBase,
} from "@/shared/errors/core/app-error-metadata.types";

/**
 * Normalized Postgres error metadata extracted from pg error objects.
 */
export interface PgErrorMetadata extends PgErrorMetadataBase {
  readonly pgCode: PgCode;
  readonly datatype?: string;
  readonly detail?: string;
  readonly hint?: string;
  readonly position?: string;
  readonly schema?: string;
  readonly severity?: string;
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
 */
export interface PgOperationMetadata extends DbOperationMetadata {}
