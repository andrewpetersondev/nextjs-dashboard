import "server-only";

import type {
  DalContextLite,
  ExecuteDalCoreOptions,
} from "@/server/db/dal/types";
import type { AppError } from "@/shared/errors/core/app-error";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

/**
 * Executes a DAL thunk and throws for unexpected failures (invariants).
 *
 * @remarks
 * Wraps errors with makeUnexpectedErrorFromUnknown to classify as unexpected.
 * Use only where failure indicates a bug; prefer executeDalResult otherwise.
 */
export async function executeDalThrow<T>(
  thunk: () => Promise<T>,
  context: DalContextLite,
  logger: LoggingClientContract,
  options: ExecuteDalCoreOptions,
): Promise<T> {
  try {
    return await thunk();
  } catch (err: unknown) {
    const error: AppError = makeUnexpectedError(err, {
      message: `Unexpected DAL failure in ${context.operation}`,
      metadata: {
        operation: context.operation,
      },
    });

    logger.operation("error", `${context.operation}.failed`, {
      error,
      operationContext: options.operationContext,
      operationIdentifiers: context.identifiers,
      operationName: context.operation,
    });

    throw error;
  }
}
