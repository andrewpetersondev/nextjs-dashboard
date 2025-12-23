import "server-only";

import type { AppError } from "@/shared/errors/core/app-error";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import {
  buildDalErrorMetadata,
  type DalContextLite,
  type ExecuteDalCoreOptions,
} from "@/shared/errors/server/dal/dal-context.schema";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

/**
 * Executes a DAL thunk and throws for unexpected failures (invariants).
 *
 * @remarks
 * - Use only where any failure indicates a bug or broken invariant.
 * - Wraps the caught error with {@link makeUnexpectedError} so callers always
 *   see an `AppError` with the `unexpected` code and DAL operation metadata.
 * - Prefer {@link executeDalResult} for expected DB failures that should be
 *   handled as `Result.Err`.
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
      metadata: buildDalErrorMetadata(context, options),
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
