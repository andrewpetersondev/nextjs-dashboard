import { z } from "zod";

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
