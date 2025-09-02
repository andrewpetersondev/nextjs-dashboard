import "server-only";

import pino from "pino";
import { getLogLevel } from "@/shared/logging/log-level";

/**
 * Pino logger instance for structured logging.
 *
 * - Configured for different log levels in production and development.
 */
export const serverLogger = pino({
  level: getLogLevel(),
  name: "server",
});
