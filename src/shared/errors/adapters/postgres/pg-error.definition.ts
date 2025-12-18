import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type { PgCondition } from "@/shared/errors/catalog/pg-conditions";

/**
 * Technical definition for mapping a Postgres error code to internal application logic.
 */
export interface PgErrorDefinition {
  readonly appCode: AppErrorKey;
  /**
   * The 5-character Postgres error code (e.g., '23505').
   */
  readonly code: string;
  readonly condition: PgCondition;
}
