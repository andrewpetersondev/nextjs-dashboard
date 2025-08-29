import "server-only";

// biome-ignore lint/correctness/noNodejsModules: <file is server only>
import process from "node:process";
import pino from "pino";

/**
 * Pino logger instance for structured logging.
 *
 * - Configured for different log levels in production and development.
 */
export const serverLogger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  name: "auth",
});
