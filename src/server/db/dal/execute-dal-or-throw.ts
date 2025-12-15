import "server-only";
import { normalizePgError } from "@/shared/errors/adapters/postgres/postgres-error.adapter";
import type { AppError } from "@/shared/errors/core/app-error.class";
import type { LoggingClientContract } from "@/shared/logging/core/logger.contracts";

export type DalIdentifiers = Record<string, number | string>;

export interface DalContextLite {
  readonly identifiers: DalIdentifiers;
  readonly operation: string;
}

export interface ExecuteDalOrThrowCoreOptions {
  readonly message?: string;
  readonly operationContext?: string;
}

export async function executeDalOrThrow<T>(
  thunk: () => Promise<T>,
  context: DalContextLite,
  logger: LoggingClientContract,
  options?: ExecuteDalOrThrowCoreOptions,
): Promise<T> {
  const message = options?.message ?? "DAL operation failed";

  try {
    return await thunk();
  } catch (err: unknown) {
    const error: AppError = normalizePgError(err, {});

    logger.operation("error", message, {
      error,
      operationContext: options?.operationContext,
      operationIdentifiers: context.identifiers,
      operationName: context.operation,
    });

    throw error;
  }
}
