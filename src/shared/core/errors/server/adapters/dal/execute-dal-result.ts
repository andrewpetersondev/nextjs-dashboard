import "server-only";

import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type {
  DalContextLite,
  ExecuteDalCoreOptions,
} from "@/shared/core/errors/server/adapters/dal/dal-context.schema";
import { normalizePgError } from "@/shared/core/errors/server/adapters/postgres/normalize-pg-error";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

/**
 * Executes a DAL thunk and returns `Result` for expected database failures.
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
