// src/server/auth/infrastructure/repository/dal/execute-dal.ts
import "server-only";
import { mapBaseErrorToInfrastructureOrDomain } from "@/server/auth/infrastructure/repository/dal/base-error.mapper";
import { toBaseErrorFromPgUnknown } from "@/server/auth/infrastructure/repository/dal/pg-error.mapper";
import type { OperationMetadata } from "@/shared/logging/logger.shared";

/**
 * Execute a DAL operation and throw normalized BaseError on failure.
 * Note: Does not log errors; caller is responsible for logging if needed.
 */
export async function executeDalOrThrow<T>(
  thunk: () => Promise<T>,
  logCtx: Readonly<OperationMetadata>,
): Promise<T> {
  try {
    return await thunk();
  } catch (err: unknown) {
    const baseError = toBaseErrorFromPgUnknown(err, logCtx);
    throw mapBaseErrorToInfrastructureOrDomain(baseError);
  }
}
