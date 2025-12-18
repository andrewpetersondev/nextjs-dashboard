import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type { Condition } from "@/shared/errors/catalog/conditions";
import { CONDITIONS } from "@/shared/errors/catalog/conditions";

export interface PgErrorDefinition {
  readonly appCode: AppErrorKey;
  readonly code: string;
  readonly condition: Condition;
  readonly name: string;
}

export const PG_ERROR_MAP = {
  checkViolation: {
    appCode: "integrity",
    code: "23514",
    condition: CONDITIONS.db_check_violation,
    name: "checkViolation",
  },
  exclusionViolation: {
    appCode: "integrity",
    code: "23P01",
    condition: CONDITIONS.db_exclusion_violation,
    name: "exclusionViolation",
  },
  foreignKeyViolation: {
    appCode: "integrity",
    code: "23503",
    condition: CONDITIONS.db_foreign_key_violation,
    name: "foreignKeyViolation",
  },
  notNullViolation: {
    appCode: "integrity",
    code: "23502",
    condition: CONDITIONS.db_not_null_violation,
    name: "notNullViolation",
  },
  uniqueViolation: {
    appCode: "conflict",
    code: "23505",
    condition: CONDITIONS.db_unique_violation,
    name: "uniqueViolation",
  },
} as const satisfies Record<string, PgErrorDefinition>;

export type PgErrorKey = keyof typeof PG_ERROR_MAP;
export type PgErrorMeta = (typeof PG_ERROR_MAP)[PgErrorKey];
export type PgCode = PgErrorMeta["code"];

export const PG_CODE_TO_META = {
  [PG_ERROR_MAP.checkViolation.code]: PG_ERROR_MAP.checkViolation,
  [PG_ERROR_MAP.exclusionViolation.code]: PG_ERROR_MAP.exclusionViolation,
  [PG_ERROR_MAP.foreignKeyViolation.code]: PG_ERROR_MAP.foreignKeyViolation,
  [PG_ERROR_MAP.notNullViolation.code]: PG_ERROR_MAP.notNullViolation,
  [PG_ERROR_MAP.uniqueViolation.code]: PG_ERROR_MAP.uniqueViolation,
} as const satisfies Record<PgCode, PgErrorMeta>;
