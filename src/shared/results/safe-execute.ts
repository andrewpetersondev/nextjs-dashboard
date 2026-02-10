import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/errors/factories/app-error.factory";
import type { LoggingClientContract } from "@/shared/logging/core/logging-client.contract";
import { Err } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Options for safe execution of an operation.
 */
export type SafeExecuteOptions = {
  readonly logger: LoggingClientContract;
  readonly message: string;
  readonly operation: string;
};

/**
 * Executes an asynchronous operation safely, wrapping it in a Result.
 * Automatically catches unknown errors, logs them, and normalizes them to an 'unexpected' AppError.
 */
export async function safeExecute<T>(
  thunk: () => Promise<Result<T, AppError>>,
  options: SafeExecuteOptions,
): Promise<Result<T, AppError>> {
  try {
    return await thunk();
  } catch (err: unknown) {
    const error = makeUnexpectedError(err, {
      message: options.message,
      overrideMetadata: { operation: options.operation },
    });

    options.logger.errorWithDetails(options.message, error, {
      operation: options.operation,
    });

    return Err(error);
  }
}
