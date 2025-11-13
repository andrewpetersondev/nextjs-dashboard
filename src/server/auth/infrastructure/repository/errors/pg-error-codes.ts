import "server-only";
import type { DatabaseError as PgDatabaseError } from "pg";

// Canonical subset of Postgres error codes used by our DAL normalization.
export const PG_ERROR_CODES = {
  checkViolation: "23514",
  deadlockDetected: "40P01",
  foreignKeyViolation: "23503",
  notNullViolation: "23502",
  serializationFailure: "40001",
  uniqueViolation: "23505",
} as const satisfies Readonly<Record<string, string>>;

export type PgCode = (typeof PG_ERROR_CODES)[keyof typeof PG_ERROR_CODES];

export const TRANSIENT_CODES = new Set<PgCode>([
  PG_ERROR_CODES.serializationFailure,
  PG_ERROR_CODES.deadlockDetected,
]);

/**
 * Extract Postgres error information from unknown error.
 */
function extractPgError(err: unknown): Partial<PgDatabaseError> | null {
  if (!err || typeof err !== "object") {
    return null;
  }

  // Check if error itself is PgDatabaseError
  if ("code" in err && typeof err.code === "string") {
    return err as Partial<PgDatabaseError>;
  }

  // Check nested cause
  if ("cause" in err && err.cause && typeof err.cause === "object") {
    return err.cause as Partial<PgDatabaseError>;
  }

  return null;
}

export const PG_CODE_SET: ReadonlySet<string> = new Set(
  Object.values(PG_ERROR_CODES),
);

export function isPgCode(code: string): code is PgCode {
  return PG_CODE_SET.has(code);
}

// Map constraint names to domain field hints.
export type ConstraintFieldHints = Readonly<Record<string, string>>;

// Default application-specific constraint hints (registration, etc)
export const SIGNUP_CONSTRAINT_HINTS: ConstraintFieldHints = {
  email: "email",
  username: "username",
  usersEmailKey: "email",
  usersEmailUnique: "email",
  usersUsernameKey: "username",
  usersUsernameUnique: "username",
};

export function buildDatabaseMessageFromCode(code: PgCode): string {
  switch (code) {
    case PG_ERROR_CODES.uniqueViolation:
      return "Unique constraint violation (23505).";
    case PG_ERROR_CODES.serializationFailure:
      return "Transaction serialization failure (40001).";
    case PG_ERROR_CODES.deadlockDetected:
      return "Deadlock detected (40P01).";
    case PG_ERROR_CODES.foreignKeyViolation:
      return "Foreign key constraint violation (23503).";
    case PG_ERROR_CODES.checkViolation:
      return "Check constraint violation (23514).";
    case PG_ERROR_CODES.notNullViolation:
      return "Not-null constraint violation (23502).";
    default:
      return "Database operation failed.";
  }
}

// Identify transient Postgres codes suitable for retry/backoff.
export function isTransientPgCode(code: PgCode): boolean {
  return (
    code === PG_ERROR_CODES.serializationFailure ||
    code === PG_ERROR_CODES.deadlockDetected
  );
}
