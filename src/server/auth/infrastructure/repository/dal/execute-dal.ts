// src/server/auth/infrastructure/repository/dal/execute-dal.ts
import "server-only";
import { mapBaseErrorToInfrastructureOrDomain } from "@/server/auth/infrastructure/repository/dal/base-error.mapper";
import { toBaseErrorFromPgUnknown } from "@/server/auth/infrastructure/repository/dal/pg-error.mapper";
import type { OperationMetadata } from "@/shared/logging/logger.shared";

/**
 * Runs a Postgres DAL operation, throwing a normalized domain/infrastructure error if rejected.
 * Errors are NOT logged here; logging is the caller's responsibility.
 * Ensures all thrown errors are subclasses of our canonical error types.
 */
export async function executeDalOrThrow<T>(
  thunk: () => Promise<T>,
  logCtx: Readonly<OperationMetadata>,
): Promise<T> {
  try {
    return await thunk();
  } catch (err: unknown) {
    const base = toBaseErrorFromPgUnknown(err, logCtx);
    // Map DB error to richer type (domain or infra) for repo surface
    throw mapBaseErrorToInfrastructureOrDomain(base);
  }
}
