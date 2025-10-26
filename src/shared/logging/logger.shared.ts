/**
 * Client-safe logger facade.
 * - In the browser, delegates to console.*
 * - On the server, also delegates to console.* by default (can be wired to a server logger later).
 * Import this module from features/shared code instead of server-only loggers.
 */

import { getLogLevel } from "@/shared/logging/get-log-level.client";
import { isLevelEnabled } from "@/shared/logging/log-level";

export function safeInvoke<TArgs extends readonly unknown[]>(
  fn: (...a: TArgs) => void,
  ...args: TArgs
): void {
  try {
    fn(...args);
  } catch {
    // no-op
  }
}

export type LogPayload = unknown;

export const currentLevel = getLogLevel();

export const sharedLogger = {
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
