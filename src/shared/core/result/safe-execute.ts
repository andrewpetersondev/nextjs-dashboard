import {
	type AppError,
	isAppError,
} from "@/shared/core/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err } from "@/shared/core/result/result";
import type { Result } from "@/shared/core/result/result.dto";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

/**
 * Options for safe execution of an operation.
 */
type SafeExecuteOptions = {
	readonly logger: LoggingClientContract;
	readonly message: string;
	readonly operation: string;
};

/**
 * Executes an asynchronous operation safely, wrapping it in a Result.
 * Automatically catches unknown errors, logs them, and normalizes them to an 'unexpected' AppError.
 *
 * If the caught error is already an AppError, it is logged and returned directly without
 * being wrapped in an 'unexpected' error.
 */
export async function safeExecute<T>(
	thunk: () => Promise<Result<T, AppError>>,
	options: SafeExecuteOptions,
): Promise<Result<T, AppError>> {
	try {
		return await thunk();
	} catch (err: unknown) {
		const error = isAppError(err)
			? err
			: makeUnexpectedError(err, {
					message: options.message,
					overrideMetadata: { operation: options.operation },
				});

		options.logger.errorWithDetails(options.message, error, {
			operation: options.operation,
		});

		return Err(error);
	}
}
