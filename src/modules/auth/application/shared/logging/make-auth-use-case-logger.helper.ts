import { AUTH_LOG_CONTEXTS } from "@/modules/auth/application/shared/logging/auth-logging.constants";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

/**
 * Standardizes logger creation for auth use cases to prevent naming drift.
 *
 * @param logger - The base logger from dependencies.
 * @param useCase - The camelCase name of the use case (e.g., "getSession").
 */
export function makeAuthUseCaseLoggerHelper(
  logger: LoggingClientContract,
  useCase: string,
): LoggingClientContract {
  return logger.child({
    scope: AUTH_LOG_CONTEXTS.USE_CASE,
    useCase,
  });
}
