import "server-only";

import pino from "pino";

export type LogMeta = {
  userId?: string;
  email?: string;
  action?: string;
  [key: string]: unknown;
};

/**
 * Centralized error logger for server actions.
 *
 * - Logs errors with context and optional metadata.
 * - Extend to integrate with external logging services.
 *
 * @param context - Context string for the error (e.g., function name).
 * @param error - The error object or message.
 * @param meta - Optional metadata for structured logging.
 */
export const logError = (
  context: string,
  error: unknown,
  meta?: LogMeta,
): void => {
  console.error(`[${context}]`, { error, ...meta });
};

/**
 * Pino logger instance for structured logging.
 *
 * - Configured for different log levels in production and development.
 */
export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  name: "auth",
});
