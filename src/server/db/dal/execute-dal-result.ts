import "server-only";

import type { DalContextLite } from "@/server/db/dal/execute-dal-or-throw";
import { normalizePgError } from "@/shared/errors/adapters/postgres/postgres-error.adapter";
import type { AppError } from "@/shared/errors/core/app-error.class";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

export interface ExecuteDalResultCoreOptions {
  readonly message?: string;
  readonly operationContext?: string;
}

/**
 * Executes a DAL thunk and returns `Result` instead of throwing.
 *
 * @remarks
 * - Use this for **expected infra failures as values** (Result-first).
 * - Still logs the normalized AppError.
 */
export async function executeDalResult<T>(
  thunk: () => Promise<T>,
  context: DalContextLite,
  logger: LoggingClientContract,
  options?: ExecuteDalResultCoreOptions,
): Promise<Result<T, AppError>> {
  const message = options?.message ?? "DAL operation failed";

  try {
    const value = await thunk();
    return Ok<T>(value);
  } catch (err: unknown) {
    const error: AppError = normalizePgError(err, {});

    logger.operation("error", message, {
      error,
      operationContext: options?.operationContext,
      operationIdentifiers: context.identifiers,
      operationName: context.operation,
    });

    return Err<AppError>(error);
  }
}
