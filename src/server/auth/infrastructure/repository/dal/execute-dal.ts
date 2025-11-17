// src/server/auth/infrastructure/repository/dal/execute-dal.ts
import "server-only";
import { mapBaseErrorToInfrastructure } from "@/server/auth/errors/base-error.mapper";
import { mapPgErrorToBase } from "@/server/auth/errors/pg-error.mapper";
import {
  type AuthLayerContext,
  toErrorContext,
} from "@/server/auth/logging/auth-layer-context";
import type { Logger } from "@/shared/logging/logger.shared";

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
  dalContext: AuthLayerContext<"infrastructure.dal">,
  logger: Logger,
): Promise<T> {
  try {
    return await thunk();
  } catch (err: unknown) {
    const baseError = mapPgErrorToBase(err, dalContext).withContext(
      toErrorContext(dalContext),
    );

    logger.errorWithDetails("DAL operation failed", baseError);

    logger.operation("error", "DAL operation error", {
      code: baseError.code,
      context: dalContext.context,
      diagnosticId: baseError.context.diagnosticId,
      operation: dalContext.operation,
      severity: baseError.severity,
      ...dalContext.identifiers,
    });

    throw mapBaseErrorToInfrastructure(baseError);
  }
}
