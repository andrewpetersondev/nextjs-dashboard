import "server-only";
import type { DalContextLite } from "@/server/db/dal/execute-dal-or-throw";
import { executeDalOrThrowCore } from "@/server/db/dal/execute-dal-or-throw";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

/**
 * Auth DAL wrapper around the generic DAL executor.
 *
 * Policy:
 * - normalize DB errors into AppError (via core)
 * - log exactly once on failure (via logger.operation)
 * - rethrow AppError
 */
export async function executeDalOrThrow<T>(
  thunk: () => Promise<T>,
  dalContext: DalContextLite,
  logger: LoggingClientContract,
): Promise<T> {
  return await executeDalOrThrowCore(thunk, dalContext, logger, {
    operationContext: "auth:dal",
  });
}
