import "server-only";

import type { AppError } from "@/shared/errors/core/app-error";
import { makeUnexpectedErrorFromUnknown } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

export type DalIdentifiers = Record<string, number | string>;

export interface DalContextLite {
  readonly identifiers: DalIdentifiers;
  readonly operation: string;
}

export interface ExecuteDalOrThrowCoreOptions {
  readonly operationContext: string;
}

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
  options: ExecuteDalOrThrowCoreOptions,
): Promise<T> {
  try {
    return await thunk();
  } catch (err: unknown) {
    const error: AppError = makeUnexpectedErrorFromUnknown(err, {
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
