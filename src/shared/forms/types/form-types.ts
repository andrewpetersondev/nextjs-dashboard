/**
 * Non-empty readonly array.
 *
 * Use this when you want a compile-time guarantee that an array has at least one element.
 *
 * @typeParam T - element type
 */
export type NonEmptyReadonlyArray<T> = readonly [T, ...(readonly T[])];

/**
 * Helper: readonly record keyed by the full set of fields.
 *
 * @typeParam K - string-literal union of keys
 * @typeParam V - value type
 */
export type DenseReadonlyRecord<K extends string, V> = Readonly<Record<K, V>>;

/**
 * Type guard to assert a readonly array is non-empty.
 */
export function hasItems<T>(
  arr: readonly T[] | undefined | null,
): arr is readonly [T, ...T[]] {
  return Array.isArray(arr) && arr.length > 0;
}
