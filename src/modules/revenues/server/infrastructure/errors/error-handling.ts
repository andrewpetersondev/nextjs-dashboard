import "server-only";

import {
  type LogMetadata,
  logError,
  logInfo,
} from "@/modules/revenues/server/application/cross-cutting/logging";

/**
 * Wraps a function with standardized error handling.
 * @param context - The logging context.
 * @param operation - The operation name.
 * @param fn - The function to execute.
 * @param metadata - Optional metadata for logging.
 * @returns The result of the function.
 * @throws Error if the function fails.
 */
export async function withErrorHandling<T>(
  context: string,
  operation: string,
  fn: () => Promise<T>,
  metadata?: LogMetadata,
): Promise<T> {
  try {
    logInfo(context, `${operation} - started`, metadata);

    const result = await fn();

    logInfo(context, `${operation} - completed successfully`, metadata);
    return result;
  } catch (error) {
    logError(context, `Error ${operation.toLowerCase()}`, error, metadata);
    throw error;
  }
}
