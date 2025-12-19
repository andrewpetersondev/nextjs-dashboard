import "server-only";

import type {
  DalContextLite,
  ExecuteDalCoreOptions,
} from "@/server/db/dal/types";
import { normalizePgError } from "@/shared/errors/adapters/postgres/normalize-pg-error";
import type { AppError } from "@/shared/errors/core/app-error";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Executes a DAL thunk and returns `Result` for expected failures.
 *
 * @remarks
 * Normalizes errors to AppError (e.g., via makeDatabaseError internally)
 * for consistent handling as values. Logs but does not throw.
 */
export async function executeDalResult<T>(
  thunk: () => Promise<T>,
  context: DalContextLite,
  logger: LoggingClientContract,
  options: ExecuteDalCoreOptions,
): Promise<Result<T, AppError>> {
  try {
    const value = await thunk();
    return Ok<T>(value);
  } catch (err: unknown) {
    // Provide required operational context to normalizePgError
    const error: AppError = normalizePgError(err, {
      entity: context.entity,
      operation: context.operation,
    });

    logger.operation("error", `${context.operation}.failed`, {
      error,
      operationContext: options.operationContext,
      operationIdentifiers: context.identifiers,
      operationName: context.operation,
    });

    return Err<AppError>(error);
  }
}
