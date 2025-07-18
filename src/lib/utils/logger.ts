import "server-only";

import pino from "pino";

export type LogMeta = {
  userId?: string;
  email?: string;
  action?: string;
  [key: string]: unknown;
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
