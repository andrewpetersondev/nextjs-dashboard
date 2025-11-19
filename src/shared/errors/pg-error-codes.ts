// src/shared/errors/pg-error-codes.ts
import { APP_ERROR_MAP, type AppErrorCode } from "@/shared/errors/error-codes";

export const PG_ERROR_MAP = {
  checkViolation: {
    appCode: APP_ERROR_MAP.database.name satisfies AppErrorCode,
    code: "23514",
    message: "db.check.violation",
    name: "checkViolation",
    retryable: false as const,
  },
  deadlockDetected: {
    appCode: APP_ERROR_MAP.database.name satisfies AppErrorCode,
    code: "40P01",
    message: "db.deadlock.detected",
    name: "deadlockDetected",
    retryable: true as const,
  },
  foreignKeyViolation: {
    appCode: APP_ERROR_MAP.database.name satisfies AppErrorCode,
    code: "23503",
    message: "db.foreign_key.violation",
    name: "foreignKeyViolation",
    retryable: false as const,
  },
  notNullViolation: {
    appCode: APP_ERROR_MAP.database.name satisfies AppErrorCode,
    code: "23502",
    message: "db.not_null.violation",
    name: "notNullViolation",
    retryable: false as const,
  },
  serializationFailure: {
    appCode: APP_ERROR_MAP.database.name satisfies AppErrorCode,
    code: "40001",
    message: "db.serialization.failure",
    name: "serializationFailure",
    retryable: true as const,
  },
  uniqueViolation: {
    appCode: APP_ERROR_MAP.database.name satisfies AppErrorCode,
    code: "23505",
    message: "db.unique.violation",
    name: "uniqueViolation",
    retryable: false as const,
  },
} as const;

export type PgErrorMeta = (typeof PG_ERROR_MAP)[keyof typeof PG_ERROR_MAP];

export type PgCode = PgErrorMeta["code"];

export const PG_CODE_TO_META: Record<PgCode, PgErrorMeta> = {
  "40P01": PG_ERROR_MAP.deadlockDetected,
  "23502": PG_ERROR_MAP.notNullViolation,
  "23503": PG_ERROR_MAP.foreignKeyViolation,
  "23505": PG_ERROR_MAP.uniqueViolation,
  "23514": PG_ERROR_MAP.checkViolation,
  "40001": PG_ERROR_MAP.serializationFailure,
} as const;
