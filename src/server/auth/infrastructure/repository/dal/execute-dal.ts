// src/server/auth/infrastructure/repository/dal/execute-dal.ts
import "server-only";
import { AuthLog, logAuth } from "@/server/auth/logging-auth/auth-log";
import { normalizePgError } from "@/shared/errors/infra/pg-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

interface DalContextLite {
  operation: string;
  identifiers: Record<string, string | number>;
}

function buildDalErrorPayload(
  op: string,
  error: unknown,
  identifiers: Record<string, string | number>,
) {
  switch (op) {
    case "getUserByEmail":
      return AuthLog.dal.getUserByEmail.error(error, identifiers);
    case "insertUser":
      return AuthLog.dal.insertUser.error(error, identifiers);
    case "demoUserCounter":
    case "demoUser":
      return AuthLog.dal.demoUserCounter.error(error, identifiers);
    case "withTransaction":
      return AuthLog.dal.withTransaction.error(
        String(identifiers.transactionId || "unknown"),
        error,
      ); // adapt
    default:
      return AuthLog.dal.insertUser.error(error, identifiers);
  }
}

/**
 * Execute DAL operation with automatic error handling.
 * - Normalizes any raw Postgres / external errors into BaseError
 * - Logs once with full context
 * - Maps BaseError to infrastructure-specific error subclasses
 *
 * DAL functions using this helper should:
 * - Not catch and re-wrap database errors themselves
 * - Only throw invariants as BaseError directly (e.g. "integrity")
 */
export async function executeDalOrThrow<T>(
  thunk: () => Promise<T>,
  dalContext: DalContextLite,
  _logger: LoggingClientContract,
): Promise<T> {
  try {
    return await thunk();
  } catch (err: unknown) {
    const baseError = normalizePgError(err, {});
    // Use unified logging
    logAuth(
      "error",
      "DAL operation failed",
      buildDalErrorPayload(
        dalContext.operation,
        baseError,
        dalContext.identifiers,
      ),
    );
    throw baseError;
  }
}
