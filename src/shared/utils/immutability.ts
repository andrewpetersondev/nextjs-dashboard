/**
 * Freeze a mutable array as readonly (for empty or general arrays).
 */
export function freezeArrayReadonly<T>(arr: T[]): readonly T[] {
  return Object.freeze([...arr]);
}
