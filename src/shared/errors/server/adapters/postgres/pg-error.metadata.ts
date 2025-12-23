import "server-only";
import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";

import type { PgErrorMetadata } from "@/shared/errors/core/db-error.metadata";
import type { PgCode } from "@/shared/errors/server/adapters/postgres/pg-codes";
import type { PgCondition } from "@/shared/errors/server/adapters/postgres/pg-conditions";

/**
 * Static mapping between a Postgres pgCode and application logic.
 */
export interface PgErrorDefinition {
  readonly appErrorKey: AppErrorKey;
  readonly pgCode: PgCode;
  readonly pgCondition: PgCondition;
}

/**
 * Result of the mapping process, strictly containing the mapping definition
 * and the extracted intrinsic pgErrorMetadata.
 */
export interface PgErrorMapping {
  readonly appErrorKey: AppErrorKey;
  readonly pgCondition: PgCondition;
  readonly pgErrorMetadata: PgErrorMetadata;
}
