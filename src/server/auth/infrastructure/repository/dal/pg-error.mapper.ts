/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: <explanation> */
import "server-only";
import { randomUUID } from "node:crypto";
import type { DatabaseError as PgDatabaseError } from "pg";
import { BaseError } from "@/shared/core/errors/base/base-error";
import { ERROR_CODES } from "@/shared/core/errors/base/error-codes";
import { ConflictError } from "@/shared/core/errors/domain/domain-errors";

function readStr(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

const SIGNUP_CONSTRAINT_HINTS: ConstraintFieldHints = {
  email: "email",
  username: "username",
  usersEmailKey: "email",
  usersEmailUnique: "email",
  usersUsernameKey: "username",
  usersUsernameUnique: "username",
};

// Canonical subset of Postgres error codes used by our DAL normalization.
const PG_ERROR_CODES = {
  checkViolation: "23514",
  deadlockDetected: "40P01",
  foreignKeyViolation: "23503",
  lockNotAvailable: "55P03",
  notNullViolation: "23502",
  queryCanceled: "57014",
  serializationFailure: "40001",
  uniqueViolation: "23505",
} as const satisfies Readonly<Record<string, string>>;

type PgCode = (typeof PG_ERROR_CODES)[keyof typeof PG_ERROR_CODES];

const PG_CODE_SET: ReadonlySet<string> = new Set(Object.values(PG_ERROR_CODES));

// Optional hook for mapping constraint names to domain field hints.
// Repos may provide a map for better conflict targeting.
type ConstraintFieldHints = Readonly<Record<string, string>>;

function buildDatabaseMessageFromCode(code: PgCode): string {
  switch (code) {
    case PG_ERROR_CODES.uniqueViolation:
      return "Unique constraint violation (23505).";
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

/**
 * Return code property from a pg error. Accepts both native instance and error-wrapped objects.
 */
function getPgCode(e: unknown): PgCode | undefined {
  // Prefer pg-native error typing for full property access
  if (
    e &&
    typeof e === "object" &&
    "code" in e &&
    typeof (e as any).code === "string"
  ) {
    const code = (e as PgDatabaseError).code;
    return code && PG_CODE_SET.has(code) ? (code as PgCode) : undefined;
  }
  // Fallback: try cause
  if (
    e &&
    typeof e === "object" &&
    "cause" in e &&
    e.cause &&
    typeof e.cause === "object"
  ) {
    const code = (e.cause as PgDatabaseError).code;
    return code && PG_CODE_SET.has(code) ? (code as PgCode) : undefined;
  }
  return;
}

// Identify transient Postgres codes suitable for retry/backoff.
function isTransientPgCode(code: PgCode): boolean {
  return (
    code === PG_ERROR_CODES.serializationFailure ||
    code === PG_ERROR_CODES.deadlockDetected ||
    code === PG_ERROR_CODES.lockNotAvailable ||
    code === PG_ERROR_CODES.queryCanceled
  );
}

/**
 * Map a PG unique violation to a ConflictError with optional field hint from constraint name.
 * Includes signup-focused constraint → field hints.
 */
function conflictFromUniqueViolation(
  err: unknown,
  logCtx: {
    readonly context?: string;
    readonly operation?: string;
    readonly identifiers?: Readonly<Record<string, unknown>>;
  },
  constraintHints?: ConstraintFieldHints,
): ConflictError {
  const pg: Partial<PgDatabaseError> | undefined =
    err as Partial<PgDatabaseError>;

  // Try to get constraint from error or nested cause
  let constraint = readStr(pg?.constraint);
  if (!constraint && err && typeof err === "object" && "cause" in err) {
    constraint = readStr(
      (err.cause as Partial<PgDatabaseError> | null)?.constraint,
    );
  }

  const hints = constraintHints ?? SIGNUP_CONSTRAINT_HINTS;
  const field = constraint ? hints[constraint] : undefined;

  const diagnosticId =
    typeof randomUUID === "function"
      ? randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Try to get message from error or nested cause
  let pgMessage = readStr(pg?.message);
  if (!pgMessage && err && typeof err === "object" && "cause" in err) {
    pgMessage = readStr(
      (err.cause as Partial<PgDatabaseError> | null)?.message,
    );
  }

  const details = {
    code: PG_ERROR_CODES.uniqueViolation,
    ...(logCtx.context ? { context: logCtx.context } : {}),
    ...(logCtx.operation ? { operation: logCtx.operation } : {}),
    ...(logCtx.identifiers ?? {}),
    ...(constraint ? { constraint } : {}),
    ...(field ? { field } : {}),
    ...(pgMessage ? { pgMessage } : {}),
    diagnosticId,
  };

  const message = field
    ? `A ${field} with this value already exists.`
    : "A record with these values already exists.";

  return new ConflictError(message, details, err);
}

/**
 * Convert unknown/PG errors into BaseError variants with normalized context.
 * - 23505 → ConflictError (with constraint/field hint when available)
 * - transient codes → details.retryable = true
 * - enrich context with pg detail/schema/table/constraint when present
 *
 * Adds `diagnosticId` and richer context for logging and error messages.
 */
export function toBaseErrorFromPgUnknown(
  err: unknown,
  ctx: Readonly<Record<string, unknown>> = {},
  constraintHints: ConstraintFieldHints = SIGNUP_CONSTRAINT_HINTS,
): BaseError {
  console.log("[toBaseErrorFromPgUnknown] Raw error:", {
    err:
      err instanceof Error
        ? {
            code: (err as any).code,
            constraint: (err as any).constraint,
            detail: (err as any).detail,
            message: err.message,
            name: err.name,
          }
        : err,
  });

  const code = getPgCode(err);
  console.log("[toBaseErrorFromPgUnknown] Extracted code:", code);

  if (code === PG_ERROR_CODES.uniqueViolation) {
    console.log(
      "[toBaseErrorFromPgUnknown] Detected unique violation, returning ConflictError",
    );
    return conflictFromUniqueViolation(
      err,
      {
        context: readStr(ctx.context) ?? "database",
        identifiers: Object.fromEntries(
          Object.entries(ctx).filter(
            ([k]) => k !== "context" && k !== "operation",
          ),
        ),
        operation: readStr(ctx.operation),
      },
      constraintHints,
    );
  }

  console.log(
    "[toBaseErrorFromPgUnknown] Falling through to generic database error",
  );

  const pg = err as Partial<PgDatabaseError> | null;
  const diagnosticId =
    typeof randomUUID === "function"
      ? randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const baseMessage = code
    ? buildDatabaseMessageFromCode(code)
    : ERROR_CODES.database.description;

  const message = baseMessage;

  const constraint = readStr(pg?.constraint);
  const operation = readStr(ctx.operation);
  const table = readStr(pg?.table);

  const details = {
    ...ctx,
    ...(code ? { code } : {}),
    ...(readStr(pg?.message) ? { pgMessage: readStr(pg?.message) } : {}),
    ...(constraint ? { constraint } : {}),
    ...(readStr(pg?.detail) ? { pgDetail: readStr(pg?.detail) } : {}),
    ...(readStr(pg?.schema) ? { schema: readStr(pg?.schema) } : {}),
    ...(table ? { table } : {}),
    ...(operation ? { operation } : {}),
    ...(code && isTransientPgCode(code) ? { retryable: true as const } : {}),
    diagnosticId,
    timestamp: new Date().toISOString(),
  };

  return BaseError.wrap("database", err, details, message);
}
