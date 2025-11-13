// src/server/auth/infrastructure/repository/dal/execute-dal.ts
import "server-only";
import { logger } from "@/shared/logging/logger.shared";
import { mapBaseErrorToInfrastructure } from "../errors/base-error.mapper";
import { toBaseErrorFromPg } from "../errors/pg-error.mapper";
import type { DalContext } from "../types/dal-context";

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
): Promise<T> {
  try {
    return await thunk();
  } catch (err: unknown) {
    // Normalize to BaseError (Postgres/external → BaseError)
    const baseError = toBaseErrorFromPg(err, dalContext);

    // Log once with full context
    logger.operation("error", `DAL operation failed: ${dalContext.operation}`, {
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
