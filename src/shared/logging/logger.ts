/**
 * Client-safe logger facade.
 * - In the browser, delegates to console.*
 * - On the server, also delegates to console.* by default (can be wired to a server logger later).
 * Import this module from features/shared code instead of server-only loggers.
 */

import { getLogLevel } from "@/shared/logging/get-log-level.client";
import { isLevelEnabled } from "@/shared/logging/log-level";

// biome-ignore lint/suspicious/noExplicitAny: <fix later>
export function safeInvoke(fn: (...a: any[]) => void, ...args: any[]): void {
  try {
    fn(...args);
  } catch {
    // no-op
  }
}

export type LogPayload = unknown;

export const currentLevel = getLogLevel();

export const logger = {
  debug(payload: LogPayload): void {
    if (isLevelEnabled(currentLevel, "debug")) {
      safeInvoke(console.debug, payload);
    }
  },
  error(payload: LogPayload): void {
    if (isLevelEnabled(currentLevel, "error")) {
      safeInvoke(console.error, payload);
    }
  },
  info(payload: LogPayload): void {
    if (isLevelEnabled(currentLevel, "info")) {
      safeInvoke(console.info, payload);
    }
  },
  warn(payload: LogPayload): void {
    if (isLevelEnabled(currentLevel, "warn")) {
      safeInvoke(console.warn, payload);
    }
  },
} as const;
