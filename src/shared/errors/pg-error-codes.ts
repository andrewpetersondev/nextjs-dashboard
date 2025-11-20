// src/shared/errors/pg-error-codes.ts

export const PG_ERROR_MAP = {
  checkViolation: {
    code: "23514",
    condition: "db_check_violation",
    name: "checkViolation",
  },
  notNullViolation: {
    code: "23502",
    condition: "db_not_null_violation",
    name: "notNullViolation",
  },
  uniqueViolation: {
    code: "23505",
    condition: "db_unique_violation",
    name: "uniqueViolation",
  },
} as const;

export type PgErrorMeta = (typeof PG_ERROR_MAP)[keyof typeof PG_ERROR_MAP];

export type PgCode = PgErrorMeta["code"];

export const PG_CODE_TO_META: Record<PgCode, PgErrorMeta> = {
  "23502": PG_ERROR_MAP.notNullViolation,
  "23505": PG_ERROR_MAP.uniqueViolation,
  "23514": PG_ERROR_MAP.checkViolation,
} as const;
