// src/shared/logging/logger.contracts.ts
import type { LogLevel } from "@/shared/config/env-schemas";
import type {
  LogEventContext,
  LogOperationData,
} from "@/shared/logging/core/logger.types";

export interface LoggingClientContract {
  debug<T>(message: string, data?: T): void;

  error<T>(message: string, data?: T): void;

  info<T>(message: string, data?: T): void;

  trace<T>(message: string, data?: T): void;

  warn<T>(message: string, data?: T): void;

  /**
   * Creates a child logger with additional context.
   */
  withContext(context: string): this;

  /**
   * Attach a request ID for correlation.
   */
  withRequest(requestId: string): this;

  /**
   * Logs an unknown error value with rich, sanitized details.
   */
  errorWithDetails(
    message: string,
    error: unknown,
    loggingContext?: LogEventContext,
  ): void;

  /**
   * Logs a structured application “operation” event.
   */
  operation<T extends Record<string, unknown>>(
    level: LogLevel,
    message: string,
    operationPayload: LogOperationData<T>,
  ): void;
}
