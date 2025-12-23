import "server-only";

/**
 * Registry of Postgres-specific error conditions.
 * Enforces 'pg_' prefix for all keys and values to maintain domain separation.
 */
export const PG_CONDITIONS = {
  pg_check_violation: "pg_check_violation",
  pg_exclusion_violation: "pg_exclusion_violation",
  pg_foreign_key_violation: "pg_foreign_key_violation",
  pg_not_null_violation: "pg_not_null_violation",
  pg_unexpected_error: "pg_unexpected_error",
  pg_unique_violation: "pg_unique_violation",
  pg_unknown_error: "pg_unknown_error",
} as const satisfies Record<`pg_${string}`, `pg_${string}`>;

export type PgCondition = (typeof PG_CONDITIONS)[keyof typeof PG_CONDITIONS];

export type _PgConditionKey = keyof typeof PG_CONDITIONS;
