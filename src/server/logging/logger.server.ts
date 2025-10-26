import "server-only";

import pino from "pino";
import { getLogLevel } from "@/server/logging/get-log-level.server";

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
 * Pino logger instance for structured logging.
 *
 * - Configured for different log levels in production and development.
 */
export const serverLogger = pino({
  level: getLogLevel(),
  name: "server",
});
