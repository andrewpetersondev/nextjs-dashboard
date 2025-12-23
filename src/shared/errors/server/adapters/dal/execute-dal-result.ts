import "server-only";

import type { AppError } from "@/shared/errors/core/app-error.entity";
import type {
  DalContextLite,
  ExecuteDalCoreOptions,
} from "@/shared/errors/server/adapters/dal/dal-context.schema";
import { normalizePgError } from "@/shared/errors/server/adapters/postgres/normalize-pg-error";
import type { LoggingClientPort } from "@/shared/logging/core/logging-client.port";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Executes a DAL thunk and returns `Result` for expected database failures.
 */
export async function executeDalResult<T>(
  thunk: () => Promise<T>,
  context: DalContextLite,
  logger: LoggingClientPort,
  options: ExecuteDalCoreOptions,
): Promise<Result<T, AppError>> {
  try {
    const value = await thunk();
    return Ok<T>(value);
  } catch (err: unknown) {
    const error = normalizePgError(err);

    logger.operation("error", `${context.operation}.failed`, {
      error,
      operationContext: options.operationContext,
      operationIdentifiers: context.identifiers,
      operationName: context.operation,
    });

    return Err<AppError>(error);
  }
}
