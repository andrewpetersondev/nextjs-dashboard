// src/shared/errors/pg-error-codes.ts

export interface PgErrorDefinition {
  readonly code: string;
  readonly condition: string;
  readonly name: string;
}

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
} as const satisfies Record<string, PgErrorDefinition>;

export type PgErrorKey = keyof typeof PG_ERROR_MAP;

export type PgErrorMeta = (typeof PG_ERROR_MAP)[PgErrorKey];

export type PgCode = PgErrorMeta["code"];

export const PG_CODE_TO_META: Record<PgCode, PgErrorMeta> = {
  [PG_ERROR_MAP.notNullViolation.code]: PG_ERROR_MAP.notNullViolation,
  [PG_ERROR_MAP.uniqueViolation.code]: PG_ERROR_MAP.uniqueViolation,
  [PG_ERROR_MAP.checkViolation.code]: PG_ERROR_MAP.checkViolation,
} as const;
