import "server-only";

import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type { PgErrorMetadata } from "@/shared/errors/core/db-error.metadata";
import type { PgCondition } from "@/shared/errors/server/adapters/postgres/pg-conditions";

/**
 * Static mapping between a Postgres code and application logic.
 */
export interface PgErrorDefinition {
  readonly appCode: AppErrorKey;
  readonly code: string;
  readonly condition: PgCondition;
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
