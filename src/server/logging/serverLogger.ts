import "server-only";

import pino from "pino";
import { getLogLevel } from "@/server/logging/get-log-level.server";

/**
 * Pino logger instance for structured logging.
 *
 * - Configured for different log levels in production and development.
 */
export const serverLogger = pino({
  level: getLogLevel(),
  name: "server",
});
