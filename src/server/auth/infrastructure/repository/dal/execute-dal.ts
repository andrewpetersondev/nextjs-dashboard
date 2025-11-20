// src/server/auth/infrastructure/repository/dal/execute-dal.ts
import "server-only";
import {
  type AuthLogLayerContext,
  toErrorContext,
  toLoggingContext,
} from "@/server/auth/logging-auth/auth-layer-context";
import { normalizePgError } from "@/shared/errors/pg-error.factory";
import type { LoggingClientContract } from "@/shared/logging/logger.contracts";

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
  dalContext: AuthLogLayerContext<"infrastructure.dal">,
  logger: LoggingClientContract,
): Promise<T> {
  try {
    return await thunk();
  } catch (err: unknown) {
    console.log("execute dal catch", err);

    // Diagnostic context for the error
    const errorContext = toErrorContext(dalContext, {
      // purely diagnostic extras only (e.g. table, queryName, diagnosticId)
    });

    const baseError = normalizePgError(err, errorContext);

    // Operational context for logging
    const loggingContext = toLoggingContext(dalContext, {
      // any log-time extras like correlationId; if you want it here, put it here,
      // not in the error's diagnostic context
      correlationId: dalContext.correlationId,
    });

    console.log(baseError.code);
    console.log(baseError.cause);
    console.log(baseError.toJson());

    logger.errorWithDetails("DAL operation failed", baseError, loggingContext);

    logger.operation("error", "DAL operation error", {
      code: baseError.code,
      diagnosticId: baseError.context.diagnosticId,
      operationContext: dalContext.loggerContext,
      operationIdentifiers: dalContext.identifiers,
      operationName: dalContext.operation,
      severity: baseError.severity,
    });

    throw baseError;
  }
}
