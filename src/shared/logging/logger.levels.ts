import { getPublicLogLevel } from "@/shared/config/env-public";
import type { LogLevel } from "@/shared/config/env-schemas";

let cachedLogLevel: LogLevel | null = null;
let cachedPriority: number | null = null;

/**
 * Derive the effective public log level at runtime.
 * Falls back to \`info\` if the public env var is missing/invalid.
 */
function getEffectiveLogLevel(): LogLevel {
  if (cachedLogLevel !== null) {
    return cachedLogLevel;
  }
  try {
    cachedLogLevel = getPublicLogLevel();
  } catch {
    console.error("getEffectiveLogLevel failed, defaulting to 'info'");
    cachedLogLevel = "info";
  }
  cachedPriority = levelPriority[cachedLogLevel];
  return cachedLogLevel;
}

/**
 * Priority by **risk of exposing sensitive information**.
 *
 * Higher number = greater exposure risk.
 *
 * @property trace - Highest risk (contains most detailed internal data)
 * @property debug - High risk (technical details, stack traces)
 * @property info  - Moderate risk (operational events)
 * @property warn  - Low risk (recoverable issues)
 * @property error - Lowest risk (usually safe to expose)
 */
export const levelPriority = {
  debug: 40,
  error: 10,
  info: 30,
  trace: 50,
  warn: 20,
} as const satisfies Record<LogLevel, number>;

/**
 * Cached console methods for minimal overhead.
 */
export const consoleMethod: Record<LogLevel, (...args: unknown[]) => void> = {
  debug: console.debug.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  trace: console.trace.bind(console),
  warn: console.warn.bind(console),
} as const;

/**
 * Get the current log level priority with safe fallback.
 *
 * @returns The cached priority, or defaults to 'info' priority if uninitialized.
 */
export function currentPriority(): number {
  if (cachedPriority === null) {
    getEffectiveLogLevel();
  }
  // Defensive fallback: should never happen after getEffectiveLogLevel, but ensures type safety
  return cachedPriority ?? levelPriority.info;
}
