import "server-only";
import pino from "pino";
import { DATABASE_ENV, LOG_LEVEL } from "@/shared/config/env-shared";

/**
 * Pino logger instance for structured logging.
 *
 * - Configured for different log levels in production and development.
 * - Use child() to create contextual loggers with bound fields.
 */
export const serverLogger = pino({
  level: LOG_LEVEL,
  name: "server",
  transport:
    DATABASE_ENV !== "production"
      ? { options: { colorize: true }, target: "pino-pretty" }
      : undefined,
});

/**
 * Type-safe server logger interface matching Pino's API.
 */
export interface ServerLogger {
  debug(obj: unknown, msg?: string): void;
  debug(msg: string): void;
  info(obj: unknown, msg?: string): void;
  info(msg: string): void;
  warn(obj: unknown, msg?: string): void;
  warn(msg: string): void;
  error(obj: unknown, msg?: string): void;
  error(msg: string): void;
  child(bindings: Record<string, unknown>): ServerLogger;
}

/**
 * Create a child logger with bound context fields.
 * Essential for request tracing, user context, etc.
 *
 * @example
 * const userLogger = createChildLogger({ userId: '123', context: 'auth' });
 * userLogger.info('User logged in'); // Automatically includes userId + context
 */
export function createChildLogger(
  bindings: Record<string, unknown>,
): ServerLogger {
  return serverLogger.child(bindings) as ServerLogger;
}
