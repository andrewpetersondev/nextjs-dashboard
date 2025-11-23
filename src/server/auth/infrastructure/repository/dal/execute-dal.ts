// src/server/auth/infrastructure/repository/dal/execute-dal.ts
import "server-only";
import type { AuthLogLayerContext } from "@/server/auth/logging-auth/auth-layer-context";
import { normalizePgError } from "@/shared/errors/infra/pg-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

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
    // Diagnostic context for the error
    const errorContext = {
      // purely diagnostic extras only (e.g. table, queryName, diagnosticId)
    };

    const baseError = normalizePgError(err, errorContext);

    // Log once at the source (DAL) with full details
    // We use .operation to keep structure consistent, passing the error explicitly
    logger.operation("error", "DAL operation failed", {
      code: baseError.code,
      diagnosticId: baseError.context.diagnosticId,
      error: baseError, // Attach error here
      operationContext: dalContext.loggerContext,
      operationIdentifiers: dalContext.identifiers,
      operationName: dalContext.operation,
      severity: baseError.severity,
    });

    throw baseError;
  }
}
