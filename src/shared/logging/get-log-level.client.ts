/**
 * Client-side log level resolver.
 * - Reads validated public env via env-public.
 * - Defaults to "info" in production builds, "warn" otherwise.
 */

import { IS_PROD, PUBLIC_ENV } from "@/shared/config/env-public";
import type { LogLevel } from "./log-level";

/**
 * Returns the effective log level for browser bundles.
 */
export function getLogLevel(): LogLevel {
  const defaultLevel: LogLevel = IS_PROD ? "info" : "warn";
  return (PUBLIC_ENV.LOG_LEVEL as LogLevel | undefined) ?? defaultLevel;
}
