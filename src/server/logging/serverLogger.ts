import "server-only";

import pino from "pino";

/**
 * Pino logger instance for structured logging.
 *
 * - Configured for different log levels in production and development.
 */
export const serverLogger = pino({
  // biome-ignore lint/style/noProcessEnv: <temp>
  // biome-ignore lint/correctness/noProcessGlobal: <temp>
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  name: "auth",
});
