import "server-only";

import { logError, logInfo } from "@/server/revenues/events/logging";

/**
 * Wraps a function with standardized error handling
 */
export async function withErrorHandling<T>(
  context: string,
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>,
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
