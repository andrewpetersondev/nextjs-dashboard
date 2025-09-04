export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export const levelOrder: LogLevel[] = [
  "debug",
  "info",
  "warn",
  "error",
  "silent",
];

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
