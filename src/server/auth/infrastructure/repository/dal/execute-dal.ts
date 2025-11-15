// src/server/auth/infrastructure/repository/dal/execute-dal.ts
import "server-only";
import type { Logger } from "@/shared/logging/logger.shared";
import type { DalContext } from "../../../logging/dal-context";
import { mapBaseErrorToInfrastructure } from "../errors/base-error.mapper";
import { toBaseErrorFromPg } from "../errors/pg-error.mapper";

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
  dalContext: DalContext,
  logger: Logger,
): Promise<T> {
  try {
    return await thunk();
  } catch (err: unknown) {
    // Normalize to BaseError (Postgres/external → BaseError)
    const baseError = toBaseErrorFromPg(err, dalContext).withContext({
      context: dalContext.context,
      operation: dalContext.operation,
      ...dalContext.identifiers,
    });

    logger.errorWithDetails("[EXECUTE DAL]", baseError);

    // Log once with full context
    logger.operation("error", "[EXECUTE DAL OPERATION]", {
      code: baseError.code,
      context: dalContext.context,
      diagnosticId: baseError.context.diagnosticId,
      operation: dalContext.operation,
      severity: baseError.severity,
      ...dalContext.identifiers,
    });

    // Map to infrastructure-specific error type
    throw mapBaseErrorToInfrastructure(baseError);
  }
}
