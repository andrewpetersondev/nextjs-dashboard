/**
 * Client-safe logger facade.
 * - In the browser, delegates to console.*
 * - Signature matches Pino's API for consistency across client/server.
 */

import {
  IS_PROD,
  NEXT_PUBLIC_LOG_LEVEL,
} from "@/shared/config/public-env.client";
import { type LogLevel, levelOrder } from "@/shared/logging/log-level";

/**
 * Format structured log data for console output.
 */
function formatLog(objOrMsg: unknown, msg?: string): unknown[] {
  if (typeof objOrMsg === "string") {
    return [objOrMsg];
  }
  if (msg) {
    return [msg, objOrMsg];
  }
  return [objOrMsg];
}

function safeInvoke<TArgs extends readonly unknown[]>(
  fn: (...a: TArgs) => void,
  ...args: TArgs
): void {
  try {
    fn(...args);
  } catch {
    // no-op
  }
}

function isLevelEnabled(current: LogLevel, methodLevel: LogLevel): boolean {
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

/**
 * Client logger with Pino-compatible API signature.
 * Supports both logger.info('message') and logger.info({data}, 'message')
 */
export const sharedLogger = {
  debug(objOrMsg: unknown, msg?: string): void {
    if (isLevelEnabled(currentLevel, "debug")) {
      safeInvoke(console.debug, ...formatLog(objOrMsg, msg));
    }
  },
  error(objOrMsg: unknown, msg?: string): void {
    if (isLevelEnabled(currentLevel, "error")) {
      safeInvoke(console.error, ...formatLog(objOrMsg, msg));
    }
  },
  info(objOrMsg: unknown, msg?: string): void {
    if (isLevelEnabled(currentLevel, "info")) {
      safeInvoke(console.info, ...formatLog(objOrMsg, msg));
    }
  },
  warn(objOrMsg: unknown, msg?: string): void {
    if (isLevelEnabled(currentLevel, "warn")) {
      safeInvoke(console.warn, ...formatLog(objOrMsg, msg));
    }
  },
} as const;
