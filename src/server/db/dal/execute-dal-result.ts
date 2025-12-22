import "server-only";

import type {
  DalContextLite,
  ExecuteDalCoreOptions,
} from "@/server/db/dal/dal-context.schema";
import { normalizePgError } from "@/server/db/errors/postgres/normalize-pg-error";
import type { AppError } from "@/shared/errors/core/app-error";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Executes a DAL thunk and returns `Result` for expected database failures.
 *
 * @remarks
 * - On success, returns `Ok<T>`.
 * - On failure, normalizes the raw Postgres error via {@link normalizePgError}
 *   using the DAL context as {@link DbOperationMetadata}, and returns `Err<AppError>`.
 * - Errors are logged but not thrown, enforcing a Result-first contract for
 *   infrastructure/database failures.
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
