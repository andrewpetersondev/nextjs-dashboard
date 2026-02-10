import "server-only";

/**
 * Registry of Postgres-specific error conditions.
 * Enforces 'pg_' prefix for all keys and values to maintain domain separation.
 */
export type PgCondition =
  | "pg_check_violation"
  | "pg_exclusion_violation"
  | "pg_foreign_key_violation"
  | "pg_not_null_violation"
  | "pg_unexpected_error"
  | "pg_unique_violation"
  | "pg_unknown_error";

export const PG_CONDITIONS: Readonly<Record<PgCondition, PgCondition>> = {
  pg_check_violation: "pg_check_violation",
  pg_exclusion_violation: "pg_exclusion_violation",
  pg_foreign_key_violation: "pg_foreign_key_violation",
  pg_not_null_violation: "pg_not_null_violation",
  pg_unexpected_error: "pg_unexpected_error",
  pg_unique_violation: "pg_unique_violation",
  pg_unknown_error: "pg_unknown_error",
};
