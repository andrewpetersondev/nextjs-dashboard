/**
 * Client-safe logger facade.
 * - In the browser, delegates to console.*
 * - On the server, also delegates to console.* by default (can be wired to a server logger later).
 * Import this module from features/shared code instead of server-only loggers.
 */

import { z } from "zod";
import {
  IS_PROD,
  NEXT_PUBLIC_LOG_LEVEL,
} from "@/shared/config/public-env.client";

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

export const LOG_LEVELS = ["debug", "info", "warn", "error", "silent"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export const LogLevelSchema = z.enum(LOG_LEVELS);

export const levelOrder: readonly LogLevel[] = LOG_LEVELS;

export function isLevelEnabled(
  current: LogLevel,
  methodLevel: LogLevel,
): boolean {
  if (current === "silent") {
    return false;
  }
  const methodIdx = levelOrder.indexOf(methodLevel);
  const currentIdx = levelOrder.indexOf(current);
  return methodIdx >= currentIdx;
}

/**
 * Returns the effective log level for browser bundles.
 */
export function getLogLevel(): LogLevel {
  const defaultLevel: LogLevel = IS_PROD ? "info" : "warn";
  return (NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined) ?? defaultLevel;
}

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
