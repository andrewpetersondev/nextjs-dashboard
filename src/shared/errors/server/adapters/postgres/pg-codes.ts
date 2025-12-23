import "server-only";

import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { PG_CONDITIONS } from "@/shared/errors/server/adapters/postgres/pg-conditions";
import type { PgErrorDefinition } from "@/shared/errors/server/adapters/postgres/pg-error.metadata";

/**
 * Valid Postgres error codes handled by the application.
 */
export type PgCode =
  | "23502" // NOT NULL VIOLATION
  | "23503" // FOREIGN KEY VIOLATION
  | "23505" // UNIQUE VIOLATION
  | "23514" // CHECK VIOLATION
  | "23P01"; // EXCLUSION VIOLATION

/**
 * Registry of known Postgres error codes.
 */
export const PG_ERROR_MAP: Record<PgCode, PgErrorDefinition> = {
  "23P01": {
    appErrorKey: APP_ERROR_KEYS.integrity,
    pgCode: "23P01",
    pgCondition: PG_CONDITIONS.pg_exclusion_violation,
  },
  "23502": {
    appErrorKey: APP_ERROR_KEYS.integrity,
    pgCode: "23502",
    pgCondition: PG_CONDITIONS.pg_not_null_violation,
  },
  "23503": {
    appErrorKey: APP_ERROR_KEYS.integrity,
    pgCode: "23503",
    pgCondition: PG_CONDITIONS.pg_foreign_key_violation,
  },
  "23505": {
    appErrorKey: APP_ERROR_KEYS.conflict,
    pgCode: "23505",
    pgCondition: PG_CONDITIONS.pg_unique_violation,
  },
  "23514": {
    appErrorKey: APP_ERROR_KEYS.integrity,
    pgCode: "23514",
    pgCondition: PG_CONDITIONS.pg_check_violation,
  },
} as const;

/**
 * High-performance lookup mapping PG codes to application error metadata.
 */
export const PG_CODE_TO_META = PG_ERROR_MAP;
