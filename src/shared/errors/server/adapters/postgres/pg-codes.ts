import "server-only";

import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { PG_CONDITIONS } from "@/shared/errors/server/adapters/postgres/pg-conditions";
import type { PgErrorDefinition } from "@/shared/errors/server/adapters/postgres/pg-error.metadata";

/**
 * Primary registry of Postgres error codes used by the application.
 */
export const PG_CODES = {
  CHECK_VIOLATION: "23514",
  EXCLUSION_VIOLATION: "23P01",
  FOREIGN_KEY_VIOLATION: "23503",
  INVARIANT_MULTIPLE_ROWS_RETURNED: "PGI_002",
  INVARIANT_NO_ROWS_RETURNED: "PGI_001",
  NOT_NULL_VIOLATION: "23502",
  UNEXPECTED_INTERNAL_ERROR: "PGI_999",
  UNIQUE_VIOLATION: "23505",
} as const;

export type PgCode = (typeof PG_CODES)[keyof typeof PG_CODES];

/**
 * Registry of known Postgres error codes and their application mappings.
 */
export const PG_ERROR_MAP: Record<PgCode, PgErrorDefinition> = {
  [PG_CODES.CHECK_VIOLATION]: {
    appErrorKey: APP_ERROR_KEYS.integrity,
    pgCode: PG_CODES.CHECK_VIOLATION,
    pgCondition: PG_CONDITIONS.pg_check_violation,
  },
  [PG_CODES.EXCLUSION_VIOLATION]: {
    appErrorKey: APP_ERROR_KEYS.integrity,
    pgCode: PG_CODES.EXCLUSION_VIOLATION,
    pgCondition: PG_CONDITIONS.pg_exclusion_violation,
  },
  [PG_CODES.FOREIGN_KEY_VIOLATION]: {
    appErrorKey: APP_ERROR_KEYS.integrity,
    pgCode: PG_CODES.FOREIGN_KEY_VIOLATION,
    pgCondition: PG_CONDITIONS.pg_foreign_key_violation,
  },
  [PG_CODES.NOT_NULL_VIOLATION]: {
    appErrorKey: APP_ERROR_KEYS.integrity,
    pgCode: PG_CODES.NOT_NULL_VIOLATION,
    pgCondition: PG_CONDITIONS.pg_not_null_violation,
  },
  [PG_CODES.UNIQUE_VIOLATION]: {
    appErrorKey: APP_ERROR_KEYS.conflict,
    pgCode: PG_CODES.UNIQUE_VIOLATION,
    pgCondition: PG_CONDITIONS.pg_unique_violation,
  },
  [PG_CODES.INVARIANT_NO_ROWS_RETURNED]: {
    appErrorKey: APP_ERROR_KEYS.integrity,
    pgCode: PG_CODES.INVARIANT_NO_ROWS_RETURNED,
    pgCondition: PG_CONDITIONS.pg_unexpected_error,
  },
  [PG_CODES.INVARIANT_MULTIPLE_ROWS_RETURNED]: {
    appErrorKey: APP_ERROR_KEYS.integrity,
    pgCode: PG_CODES.INVARIANT_MULTIPLE_ROWS_RETURNED,
    pgCondition: PG_CONDITIONS.pg_unexpected_error,
  },
  [PG_CODES.UNEXPECTED_INTERNAL_ERROR]: {
    appErrorKey: APP_ERROR_KEYS.unexpected,
    pgCode: PG_CODES.UNEXPECTED_INTERNAL_ERROR,
    pgCondition: PG_CONDITIONS.pg_unexpected_error,
  },
} as const;

/**
 * High-performance lookup mapping PG codes to application error metadata.
 */
export const PG_CODE_TO_META: Record<PgCode, PgErrorDefinition> = PG_ERROR_MAP;
