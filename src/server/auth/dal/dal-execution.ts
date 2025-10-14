import "server-only";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import { serverLogger } from "@/server/logging/serverLogger";
import { BaseError } from "@/shared/core/errors/base/base-error";
import { ConflictError } from "@/shared/core/errors/domain/domain-errors";

function readStr(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
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

/**
 * Map a PG unique violation to a ConflictError with optional field hint from constraint name.
 */
function conflictFromUniqueViolation(
  err: unknown,
  logCtx: {
    readonly context: string;
    readonly identifiers?: Readonly<Record<string, unknown>>;
  },
  constraintHints?: ConstraintFieldHints,
): ConflictError {
  const constraint = readStr((err as PgErrorLike | null)?.constraint);
  const field =
    constraint && constraintHints ? constraintHints[constraint] : undefined;
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
 * Narrow Pg error shape with readonly fields for safety.
 */
export interface PgErrorLike {
  readonly code?: unknown;
  readonly message?: unknown;
  readonly name?: unknown;
  readonly constraint?: unknown;
}

/**
 * Canonical subset of Postgres error codes used by our DAL normalization.
 */
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

/**
 * Optional hook for mapping constraint names to domain field hints.
 * Repos may provide a map for better conflict targeting.
 */
export type ConstraintFieldHints = Readonly<Record<string, string>>;

/**
 * Safely extract a known Postgres error code from unknown.
 */
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

/**
 * Identify transient Postgres codes suitable for retry/backoff.
 */
export function isTransientPgCode(code: PgCode): boolean {
  return (
    code === PG_ERROR_CODES.serializationFailure ||
    code === PG_ERROR_CODES.deadlockDetected ||
    code === PG_ERROR_CODES.lockNotAvailable ||
    code === PG_ERROR_CODES.queryCanceled
  );
}

/**
 * Detect unique violation (23505).
 */
export function isPgUniqueViolation(e: unknown): boolean {
  return getPgCode(e) === PG_ERROR_CODES.uniqueViolation;
}

/**
 * Convert unknown/PG errors into BaseError variants with normalized context.
 * - 23505 → ConflictError
 * - transient codes → details.retryable = true
 */
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
  const details = {
    ...ctx,
    ...(code ? { code } : {}),
    ...(code && isTransientPgCode(code) ? { retryable: true as const } : {}),
  };
  return BaseError.wrap("DATABASE", err, details, message);
}

/**
 * Assertion helper for DAL invariants. Logs and throws DatabaseError if violated.
 */
export function assertDalInvariant(
  condition: unknown,
  message: string,
  details?: Readonly<Record<string, unknown>>,
): asserts condition {
  if (condition) {
    return;
  }
  serverLogger.error(
    { kind: "invariant", layer: "dal", ...(details ?? {}) },
    message,
  );
  throw new DatabaseError(message, { layer: "dal", ...(details ?? {}) });
}

/**
 * Execute an async DAL operation, normalize/throw database errors, and log minimal context.
 *
 * Throws:
 * - ConflictError on 23505
 * - DatabaseError otherwise (transient codes include details.retryable = true)
 */
export async function executeDalOrThrow<T>(
  op: () => Promise<T>,
  logCtx: {
    readonly context: string;
    readonly identifiers?: Readonly<Record<string, unknown>>;
    readonly constraintHints?: ConstraintFieldHints;
  } = { context: "dal.operation" },
): Promise<T> {
  try {
    return await op();
  } catch (e: unknown) {
    if (isPgUniqueViolation(e)) {
      const conflict = conflictFromUniqueViolation(
        e,
        logCtx,
        logCtx.constraintHints,
      );
      const d = conflict.getDetails() as Readonly<
        Record<string, unknown> & { constraint?: string; field?: string }
      >;

      serverLogger.warn(
        {
          context: logCtx.context,
          ...(logCtx.identifiers ?? {}),
          code: PG_ERROR_CODES.uniqueViolation,
          ...(d.constraint ? { constraint: d.constraint } : {}),
          ...(d.field ? { field: d.field } : {}),
          kind: "db",
        },
        "Unique constraint violation",
      );
      throw conflict;
    }

    const code = getPgCode(e);
    const msg = buildDatabaseMessage(e);
    const details =
      code && isTransientPgCode(code)
        ? { ...logCtx, code, retryable: true as const }
        : { ...logCtx, ...(code ? { code } : {}) };

    serverLogger.error(
      {
        context: logCtx.context,
        ...(logCtx.identifiers ?? {}),
        ...(code ? { code } : {}),
        kind: "db",
      },
      "Database error",
    );
    throw new DatabaseError(msg, details, e);
  }
}

/**
 * Execute a sync DAL operation with the same error normalization as executeDalOrThrow.
 */
export function executeDalSyncOrThrow<T>(
  op: () => T,
  logCtx: {
    readonly context: string;
    readonly identifiers?: Readonly<Record<string, unknown>>;
    readonly constraintHints?: ConstraintFieldHints;
  } = { context: "dal.operation" },
): T {
  try {
    return op();
  } catch (e: unknown) {
    if (isPgUniqueViolation(e)) {
      const conflict = conflictFromUniqueViolation(
        e,
        logCtx,
        logCtx.constraintHints,
      );
      const d = conflict.getDetails() as Readonly<
        Record<string, unknown> & { constraint?: string; field?: string }
      >;

      serverLogger.warn(
        {
          context: logCtx.context,
          ...(logCtx.identifiers ?? {}),
          code: PG_ERROR_CODES.uniqueViolation,
          ...(d.constraint ? { constraint: d.constraint } : {}),
          ...(d.field ? { field: d.field } : {}),
          kind: "db",
        },
        "Unique constraint violation",
      );
      throw conflict;
    }

    const code = getPgCode(e);
    const msg = buildDatabaseMessage(e);
    const details =
      code && isTransientPgCode(code)
        ? { ...logCtx, code, retryable: true as const }
        : { ...logCtx, ...(code ? { code } : {}) };

    serverLogger.error(
      {
        context: logCtx.context,
        ...(logCtx.identifiers ?? {}),
        ...(code ? { code } : {}),
        kind: "db",
      },
      "Database error",
    );
    throw new DatabaseError(msg, details, e);
  }
}

/**
 * Transaction helper that centralizes error normalization.
 * db must provide a .transaction(fn) API compatible with Drizzle/pg clients.
 */
export async function withDalTransaction<T>(
  db: { transaction: <R>(fn: (tx: unknown) => Promise<R>) => Promise<R> },
  fn: (tx: unknown) => Promise<T>,
  logCtx: {
    readonly context: string;
    readonly identifiers?: Readonly<Record<string, unknown>>;
    readonly constraintHints?: ConstraintFieldHints;
  },
): Promise<T> {
  return await executeDalOrThrow(() => db.transaction((tx) => fn(tx)), logCtx);
}
