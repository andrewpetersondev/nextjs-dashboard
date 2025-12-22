import "server-only";

import type { PgCondition } from "@/server/db/errors/postgres/pg-conditions";
import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type { PgErrorMetadataBase } from "@/shared/errors/core/app-error-metadata.types";

/**
 * Static mapping between a Postgres code and application logic.
 */
export interface PgErrorDefinition {
  readonly appCode: AppErrorKey;
  readonly code: string;
  readonly condition: PgCondition;
}

/**
 * Intrinsic database metadata extracted from the error object.
 * These are "Error Metadata" properties.
 */
export interface PgErrorMetadata extends PgErrorMetadataBase {
  readonly datatype?: string;
  readonly detail?: string;
  readonly hint?: string;
  readonly pgCode: string;
  readonly position?: string;
  readonly schema?: string;
  readonly severity?: string;
  readonly where?: string;
}

/**
 * Result of the mapping process, strictly containing the mapping definition
 * and the extracted intrinsic metadata.
 */
export interface PgErrorMapping {
  readonly appCode: AppErrorKey;
  readonly condition: PgCondition;
  readonly metadata: PgErrorMetadata;
}
