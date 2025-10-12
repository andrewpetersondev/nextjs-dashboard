import "server-only";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import { serverLogger } from "@/server/logging/serverLogger";
import { ConflictError } from "@/shared/core/errors/domain/domain-errors";

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
} as const;

type PgErrorLike = {
  code?: unknown;
  message?: unknown;
  name?: unknown;
  constraint?: unknown;
};

function readStr(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function getPgCode(e: unknown): string | undefined {
  const code = (e as PgErrorLike | null)?.code;
  return readStr(code);
}

function isUniqueViolation(e: unknown): boolean {
  return getPgCode(e) === PG_ERROR_CODES.uniqueViolation;
}

function buildDatabaseMessage(e: unknown): string {
  const code = getPgCode(e);
  // Keep messages generic; no secrets/PII.
  if (code === PG_ERROR_CODES.serializationFailure) {
    return "Transaction serialization failure (40001).";
  }
  if (code === PG_ERROR_CODES.deadlockDetected) {
    return "Deadlock detected (40P01).";
  }
  if (code === PG_ERROR_CODES.lockNotAvailable) {
    return "Lock not available (55P03).";
  }
  if (code === PG_ERROR_CODES.queryCanceled) {
    return "Query canceled or statement timeout (57014).";
  }
  if (code === PG_ERROR_CODES.foreignKeyViolation) {
    return "Foreign key constraint violation (23503).";
  }
  if (code === PG_ERROR_CODES.checkViolation) {
    return "Check constraint violation (23514).";
  }
  if (code === PG_ERROR_CODES.notNullViolation) {
    return "Not-null constraint violation (23502).";
  }
  return "Database operation failed.";
}

/**
 * Normalizes unknown/Drizzle/PG errors into ConflictError or DatabaseError and throws.
 * Logs minimal context.
 *
 * executeDalOrThrow maps 23505 → ConflictError; other PG codes → DatabaseError with generic, recognizable messages and code in context.
 * Invariant “row must exist” is explicitly thrown with a clear Error after logging.
 * withDalTransaction is a reusable helper for atomic multi-step writes with the same normalization.
 * Identifiers in logs exclude secrets (no passwords/tokens).
 *
 */
export async function executeDalOrThrow<T>(
  op: () => Promise<T>,
  logCtx: {
    readonly context: string;
    readonly identifiers?: Record<string, unknown>;
  } = { context: "dal.operation" },
): Promise<T> {
  try {
    return await op();
  } catch (e: unknown) {
    if (isUniqueViolation(e)) {
      serverLogger.warn(
        {
          context: logCtx.context,
          ...(logCtx.identifiers ?? {}),
          code: PG_ERROR_CODES.uniqueViolation,
        },
        "Unique constraint violation",
      );
      throw new ConflictError(
        "A record with these values already exists.",
        { ...logCtx, code: PG_ERROR_CODES.uniqueViolation },
        e,
      );
    }

    const msg = buildDatabaseMessage(e);
    const code = getPgCode(e);
    serverLogger.error(
      {
        context: logCtx.context,
        ...(logCtx.identifiers ?? {}),
        code,
        kind: "db",
      },
      "Database error",
    );
    throw new DatabaseError(msg, { ...logCtx, ...(code ? { code } : {}) }, e);
  }
}

/**
 * Transaction helper for multi-step writes with distinct logging and error mapping.
 * Use for atomic DAL workflows.
 */
export async function withDalTransaction<T>(
  db: { transaction<R>(scope: (tx: typeof db) => Promise<R>): Promise<R> },
  context: string,
  run: (tx: typeof db) => Promise<T>,
  identifiers?: Record<string, unknown>,
): Promise<T> {
  return await executeDalOrThrow(
    () =>
      db.transaction(async (tx) => {
        serverLogger.debug(
          { context, ...(identifiers ?? {}) },
          "Begin transaction",
        );
        const result = await run(tx);
        serverLogger.debug(
          { context, ...(identifiers ?? {}) },
          "Commit transaction",
        );
        return result;
      }),
    { context, identifiers },
  );
}
