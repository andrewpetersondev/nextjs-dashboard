// Add constraint -> field hints for signup (email/username conflicts)
import { BaseError } from "@/shared/core/errors/base/base-error";
import { ConflictError } from "@/shared/core/errors/domain/domain-errors";

function readStr(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export const SIGNUP_CONSTRAINT_HINTS: ConstraintFieldHints = {
  users_email_key: "email",
  // drizzle/pg typical naming patterns; adjust to your actual constraint names if different
  users_email_unique: "email",
  users_username_key: "username",
  users_username_unique: "username",
};

// Narrow Pg error shape with readonly fields for safety.
export interface PgErrorLike {
  readonly code?: unknown;
  readonly message?: unknown;
  readonly name?: unknown;
  readonly constraint?: unknown;
  readonly detail?: unknown;
  readonly schema?: unknown;
  readonly table?: unknown;
}

// Canonical subset of Postgres error codes used by our DAL normalization.
export const PG_ERROR_CODES = {
  checkViolation: "23514",
  deadlockDetected: "40P01",
  foreignKeyViolation: "23503",
  lockNotAvailable: "55P03",
  notNullViolation: "23502",
  queryCanceled: "57014",
  serializationFailure: "40001",
  uniqueViolation: "23505",
} as const satisfies Readonly<Record<string, string>>;

export type PgCode = (typeof PG_ERROR_CODES)[keyof typeof PG_ERROR_CODES];

// Optional hook for mapping constraint names to domain field hints.
// Repos may provide a map for better conflict targeting.
export type ConstraintFieldHints = Readonly<Record<string, string>>;

export function buildDatabaseMessageFromCode(code: PgCode): string {
  switch (code) {
    case PG_ERROR_CODES.serializationFailure:
      return "Transaction serialization failure (40001).";
    case PG_ERROR_CODES.deadlockDetected:
      return "Deadlock detected (40P01).";
    case PG_ERROR_CODES.lockNotAvailable:
      return "Lock not available (55P03).";
    case PG_ERROR_CODES.queryCanceled:
      return "Query canceled or statement timeout (57014).";
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

// Safely extract a known Postgres error code from unknown.
export function getPgCode(e: unknown): PgCode | undefined {
  const code = (e as PgErrorLike | null)?.code;
  const s = readStr(code);
  if (!s) {
    return;
  }
  return (Object.values(PG_ERROR_CODES) as readonly string[]).includes(s)
    ? (s as PgCode)
    : undefined;
}

// Identify transient Postgres codes suitable for retry/backoff.
export function isTransientPgCode(code: PgCode): boolean {
  return (
    code === PG_ERROR_CODES.serializationFailure ||
    code === PG_ERROR_CODES.deadlockDetected ||
    code === PG_ERROR_CODES.lockNotAvailable ||
    code === PG_ERROR_CODES.queryCanceled
  );
}

// Detect unique violation (23505).
export function isPgUniqueViolation(e: unknown): boolean {
  return getPgCode(e) === PG_ERROR_CODES.uniqueViolation;
}

/**
 * Map a PG unique violation to a ConflictError with optional field hint from constraint name.
 * Includes signup-focused constraint → field hints.
 */
export function conflictFromUniqueViolation(
  err: unknown,
  logCtx: {
    readonly context: string;
    readonly identifiers?: Readonly<Record<string, unknown>>;
  },
  constraintHints?: ConstraintFieldHints,
): ConflictError {
  const constraint = readStr((err as PgErrorLike | null)?.constraint);
  const field =
    constraint && (constraintHints ?? SIGNUP_CONSTRAINT_HINTS)
      ? (constraintHints ?? SIGNUP_CONSTRAINT_HINTS)[constraint]
      : undefined;
  const details = {
    ...logCtx,
    code: PG_ERROR_CODES.uniqueViolation,
    ...(constraint ? { constraint } : {}),
    ...(field ? { field } : {}),
  };
  return new ConflictError(
    "A record with these values already exists.",
    details,
    err,
  );
}

/**
 * Convert unknown/PG errors into BaseError variants with normalized context.
 * - 23505 → ConflictError (with constraint/field hint when available)
 * - transient codes → details.retryable = true
 * - enrich context with pg detail/schema/table/constraint when present
 */
export function toBaseErrorFromPgUnknown(
  err: unknown,
  ctx: Readonly<Record<string, unknown>> = {},
): BaseError {
  const code = getPgCode(err);
  if (code === PG_ERROR_CODES.uniqueViolation) {
    return conflictFromUniqueViolation(
      err,
      //      { context: readStr(ctx["context"]) ?? "database", identifiers: ctx },
      { context: readStr(ctx.context) ?? "database", identifiers: ctx },

      SIGNUP_CONSTRAINT_HINTS,
    );
  }
  const message = code
    ? buildDatabaseMessageFromCode(code)
    : "Database operation failed.";

  const pg = err as PgErrorLike | null;
  const details = {
    ...ctx,
    ...(code ? { code } : {}),
    ...(readStr(pg?.constraint) ? { constraint: readStr(pg?.constraint) } : {}),
    ...(readStr(pg?.detail) ? { detail: readStr(pg?.detail) } : {}),
    ...(readStr(pg?.schema) ? { schema: readStr(pg?.schema) } : {}),
    ...(readStr(pg?.table) ? { table: readStr(pg?.table) } : {}),
    ...(code && isTransientPgCode(code) ? { retryable: true as const } : {}),
  };

  // Normalize unknown/Error into canonical DATABASE code; preserve cause
  return BaseError.wrap("DATABASE", err, details, message);
}
