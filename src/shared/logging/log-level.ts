import process from "node:process";

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export const levelOrder: LogLevel[] = [
  "debug",
  "info",
  "warn",
  "error",
  "silent",
];

export function getLogLevel(): LogLevel {
  const raw =
    (typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined)
      : undefined) ?? (process.env.LOG_LEVEL as LogLevel | undefined);

  const isProd = (process.env.NODE_ENV ?? "development") === "production";

  const defaultLevel: LogLevel = isProd ? "info" : "warn";

  if (!raw) {
    return defaultLevel;
  }
  return levelOrder.includes(raw) ? raw : defaultLevel;
}

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
