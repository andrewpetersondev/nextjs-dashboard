import type { LogLevel } from "@/shared/core/config/env-schemas";
import type {
  LogEventContext,
  LogOperationData,
} from "@/shared/telemetry/logging/core/logger.types";

/**
 * Primary boundary for logging infrastructure.
 * Defines the capabilities available to the application layer.
 */
export interface LoggingClientContract {
  /**
   * Creates a child logger with persistent structured bound data.
   */
  child(bindings: Record<string, unknown>): LoggingClientContract;

  debug<T>(message: string, data?: T): void;

  error<T>(message: string, data?: T): void;

  /**
   * Logs an unknown error value with rich, sanitized details.
   */
  errorWithDetails(
    message: string,
    error: unknown,
    loggingContext: LogEventContext,
  ): void;

  info<T>(message: string, data: T): void;

  /**
   * Logs a structured application “operation” event.
   */
  operation<T extends Record<string, unknown>>(
    level: LogLevel,
    message: string,
    operationPayload: LogOperationData<T>,
  ): void;

  trace<T>(message: string, data?: T): void;

  warn<T>(message: string, data?: T): void;

  /**
   * Creates a child logger with additional context string.
   */
  withContext(context: string): LoggingClientContract;

  /**
   * Attach a request ID for correlation.
   */
  withRequest(requestId: string): LoggingClientContract;
}
