import "server-only";
import { AuthLog, logAuth } from "@/server/auth/logging/auth-log";
import type { AuthLogBase } from "@/server/auth/logging/auth-logging.types";
import { normalizePgError } from "@/shared/infrastructure/errors/adapters/postgres/postgres-error.adapter";
import type { LoggingClientContract } from "@/shared/infrastructure/logging/core/logger.contracts";

interface DalContextLite {
  identifiers: Record<string, string | number>;
  operation: string;
}

function buildDalErrorPayload(
  op: string,
  error: unknown,
  identifiers: Record<string, string | number>,
): AuthLogBase {
  let payload: AuthLogBase;

  switch (op) {
    case "getUserByEmail":
      payload = AuthLog.dal.getUserByEmail.error(error, identifiers);
      break;
    case "insertUser":
      payload = AuthLog.dal.insertUser.error(error, identifiers);
      break;
    case "demoUserCounter":
    case "demoUser":
      payload = AuthLog.dal.demoUserCounter.error(error, identifiers);
      break;
    case "withTransaction":
      payload = AuthLog.dal.withTransaction.error(
        String(identifiers.transactionId || "unknown"),
        error,
      );
      break;
    default:
      // Generic fallback for unknown operations - use insertUser error as template
      // since we don't have a generic dal error factory
      payload = AuthLog.dal.insertUser.error(error, {
        ...identifiers,
        unknownOperation: op,
      });
      break;
  }

  return payload;
}

/**
 * Execute DAL operation with automatic error handling.
 * - Normalizes any raw Postgres / external errors into AppError
 * - Logs once with full context
 * - Maps AppError to infrastructure-specific error subclasses
 *
 * DAL functions using this helper should:
 * - Not catch and re-wrap database errors themselves
 * - Only throw invariants as AppError directly (e.g. "integrity")
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
