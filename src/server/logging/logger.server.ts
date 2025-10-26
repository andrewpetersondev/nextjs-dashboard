import "server-only";

import pino from "pino";
import { DATABASE_ENV, LOG_LEVEL } from "@/server/config/env-next";
import type { LogLevel } from "@/shared/logging/logger.shared";

/**
 * Shared shape for structured log entries.
 */
interface LogContext {
  context: string;
  kind: string;
  message: string;

  [key: string]: unknown;
}

/**
 * Factory helper for creating structured log contexts.
 */
export function createLogContext(
  context: string,
  kind: string,
  message: string,
  extra?: Record<string, unknown>,
): LogContext {
  return { context, kind, message, ...extra };
}

/**
 * Returns the effective log level for server/runtime.
 */
export function getLogLevel(): LogLevel {
  const defaultLevel: LogLevel =
    DATABASE_ENV === "production" ? "info" : "warn";
  return (LOG_LEVEL as LogLevel | undefined) ?? defaultLevel;
}

/**
 * Pino logger instance for structured logging.
 *
 * - Configured for different log levels in production and development.
 */
export const serverLogger = pino({
  level: getLogLevel(),
  name: "server",
});
