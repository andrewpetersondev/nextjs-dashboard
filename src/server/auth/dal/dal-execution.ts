import "server-only";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import { serverLogger } from "@/server/logging/serverLogger";
import { BaseError } from "@/shared/core/errors/base/base-error";
import { ConflictError } from "@/shared/core/errors/domain/domain-errors";

// Narrow Pg error shape with readonly fields for safety.
interface PgErrorLike {
  readonly code?: unknown;
  readonly message?: unknown;
  readonly name?: unknown;
  readonly constraint?: unknown;
}

// Postgres codes we want to surface distinctly in logs/messages.
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

function readStr(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function getPgCode(e: unknown): PgCode | undefined {
  const code = (e as PgErrorLike | null)?.code;
  const s = readStr(code);
  if (!s) {
    return;
  }
  return (Object.values(PG_ERROR_CODES) as readonly string[]).includes(s)
    ? (s as PgCode)
    : undefined;
}

function buildDatabaseMessageFromCode(code: PgCode): string {
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

function buildDatabaseMessage(e: unknown): string {
  const code = getPgCode(e);
  return code
    ? buildDatabaseMessageFromCode(code)
    : "Database operation failed.";
}

export function isPgUniqueViolation(e: unknown): boolean {
  return getPgCode(e) === PG_ERROR_CODES.uniqueViolation;
}

export function toDatabaseBaseError(
  err: unknown,
  ctx: Readonly<Record<string, unknown>> = {},
): BaseError {
  const code = getPgCode(err);
  if (code === PG_ERROR_CODES.uniqueViolation) {
    return new ConflictError(
      "A record with these values already exists.",
      { ...ctx, code },
      err,
    );
  }
  const message = code
    ? buildDatabaseMessageFromCode(code)
    : "Database operation failed.";
  return BaseError.wrap(
    "DATABASE",
    err,
    { ...ctx, ...(code ? { code } : {}) },
    message,
  );
}

/**
 * Normalizes unknown/Drizzle/PG errors into ConflictError or DatabaseError and throws.
 * Logs minimal context.
 *
 * executeDalOrThrow maps 23505 → ConflictError; other PG codes → DatabaseError with generic, recognizable messages and code in context.
 */
export async function executeDalOrThrow<T>(
  op: () => Promise<T>,
  logCtx: {
    readonly context: string;
    readonly identifiers?: Readonly<Record<string, unknown>>;
  } = { context: "dal.operation" },
): Promise<T> {
  try {
    return await op();
  } catch (e: unknown) {
    if (isPgUniqueViolation(e)) {
      serverLogger.warn(
        {
          context: logCtx.context,
          ...(logCtx.identifiers ?? {}),
          code: PG_ERROR_CODES.uniqueViolation,
          kind: "db",
        },
        "Unique constraint violation",
      );
      throw new ConflictError(
        "A record with these values already exists.",
        { ...logCtx, code: PG_ERROR_CODES.uniqueViolation },
        e,
      );
    }

    const code = getPgCode(e);
    const msg = buildDatabaseMessage(e);
    serverLogger.error(
      {
        context: logCtx.context,
        ...(logCtx.identifiers ?? {}),
        ...(code ? { code } : {}),
        kind: "db",
      },
      "Database error",
    );
    throw new DatabaseError(msg, { ...logCtx, ...(code ? { code } : {}) }, e);
  }
}
