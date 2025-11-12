// src/server/auth/infrastructure/repository/dal/execute-dal.ts
import "server-only";
import { repoErrorLogger } from "@/server/auth/infrastructure/repository/dal/repo-error.logger";
import { mapBaseErrorToInfrastructureOrDomain } from "@/server/auth/infrastructure/repository/errors/base-error.mapper";
import { toBaseErrorFromPgUnknown } from "@/server/auth/infrastructure/repository/errors/pg-error.mapper";
import type { OperationMetadata } from "@/shared/logging/logger.shared";

/**
 * Runs a Postgres DAL operation, throwing a normalized domain/infrastructure error if rejected.
 * Logs errors with full diagnostic context before throwing.
 * Ensures all thrown errors are subclasses of our canonical error types.
 *
 * @param thunk - The async operation to execute
 * @param logCtx - Operation metadata for logging and error context
 * @param additionalContext - Optional additional context for error logging
 * @returns The result of the operation
 * @throws {ConflictError | DatabaseError} Normalized error with full context
 */
export async function executeDalOrThrow<T>(
  thunk: () => Promise<T>,
  logCtx: Readonly<OperationMetadata>,
  additionalContext?: Record<string, unknown>,
): Promise<T> {
  try {
    const result = await thunk();
    repoErrorLogger.logDalSuccess(logCtx);
    return result;
  } catch (err: unknown) {
    const base = toBaseErrorFromPgUnknown(err, {
      ...logCtx,
      ...logCtx.identifiers,
      ...additionalContext,
    });

    // Log the error with full diagnostic context
    repoErrorLogger.logDalError(base, logCtx, additionalContext);

    // Map DB error to richer type (domain or infra) for repo surface
    throw mapBaseErrorToInfrastructureOrDomain(base);
  }
}
