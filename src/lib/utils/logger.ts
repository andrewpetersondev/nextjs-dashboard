import "server-only";

import pino from "pino";

/**
 * Pino logger instance for structured logging.
 *
 * - Configured for different log levels in production and development.
 */
export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  name: "auth",
});
