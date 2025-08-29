export function makeMessageKeyGuard<T extends Record<string, string>>(map: T) {
  const values = Object.values(map);
  const set = new Set<string>(values);

  return function isMessageKey(value: unknown): value is T[keyof T] {
    return typeof value === "string" && set.has(value);
  };
}
