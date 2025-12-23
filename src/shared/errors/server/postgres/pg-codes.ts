/** biome-ignore-all lint/style/useNamingConvention: Public contract constant; keep stable identifier.*/
import "server-only";

import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { PG_CONDITIONS } from "@/shared/errors/server/postgres/pg-conditions";
import type { PgErrorDefinition } from "@/shared/errors/server/postgres/pg-error.metadata";

/**
 * Registry of known Postgres error codes.
 * Keys are the native Postgres numeric codes to ensure zero-drift mapping.
 */
export const PG_ERROR_MAP = {
  "23P01": {
    appCode: APP_ERROR_KEYS.integrity,
    code: "23P01",
    condition: PG_CONDITIONS.pg_exclusion_violation,
  },
  "23502": {
    appCode: APP_ERROR_KEYS.integrity,
    code: "23502",
    condition: PG_CONDITIONS.pg_not_null_violation,
  },
  "23503": {
    appCode: APP_ERROR_KEYS.integrity,
    code: "23503",
    condition: PG_CONDITIONS.pg_foreign_key_violation,
  },
  "23505": {
    appCode: APP_ERROR_KEYS.conflict,
    code: "23505",
    condition: PG_CONDITIONS.pg_unique_violation,
  },
  "23514": {
    appCode: APP_ERROR_KEYS.integrity,
    code: "23514",
    condition: PG_CONDITIONS.pg_check_violation,
  },
} as const satisfies Record<string, PgErrorDefinition>;

export type PgCode = keyof typeof PG_ERROR_MAP;

/**
 * High-performance lookup mapping PG codes to application error metadata.
 */
export const PG_CODE_TO_META: Record<PgCode, PgErrorDefinition> = PG_ERROR_MAP;
