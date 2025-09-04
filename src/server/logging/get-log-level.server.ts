/**
 * Server-side log level resolver.
 * - Uses validated server env from env-next.
 * - Defaults to "info" in production DB env, "warn" otherwise.
 */

import "server-only";

import { DATABASE_ENV, LOG_LEVEL } from "@/server/config/env-next";
import type { LogLevel } from "@/shared/logging/log-level";

/**
 * Returns the effective log level for server/runtime.
 */
export function getLogLevel(): LogLevel {
  const defaultLevel: LogLevel =
    DATABASE_ENV === "production" ? "info" : "warn";
  return (LOG_LEVEL as LogLevel | undefined) ?? defaultLevel;
}
