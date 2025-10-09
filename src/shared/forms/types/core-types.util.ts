/**
 * Represents a readonly array that is guaranteed to contain at least one element.
 *
 * @typeParam T - The type of elements in the array.
 * @example
 * const example: NonEmptyReadonlyArray<number> = [1, 2, 3];
 * @readonly
 */
export type NonEmptyReadonlyArray<T> = readonly [T, ...(readonly T[])];

/**
 * Represents a readonly record type with dense, string-based keys and generic values.
 *
 * @typeParam K - The type of the string keys in the record.
 * @typeParam V - The type of the values associated with the keys.
 * @readonly
 * @example
 * const record: DenseReadonlyRecord<'key1' | 'key2', number> = { key1: 1, key2: 2 };
 */
export type DenseReadonlyRecord<K extends string, V> = Readonly<Record<K, V>>;

/**
 * Determines if the given array has one or more items.
 *
 * @param arr - The array to check; can be `undefined` or `null`.
 * @returns `true` if the array is non-empty, otherwise `false`.
 * @typeParam T - The type of elements in the array.
 * @example
 * hasItems([1, 2, 3]); // true
 * hasItems([]); // false
 * hasItems(null); // false
 */
export function isNonEmptyArray<T>(
  arr: readonly T[] | null | undefined,
): arr is readonly [T, ...(readonly T[])] {
  // Avoids mutating or widening; purely a predicate
  return Array.isArray(arr) && arr.length > 0;
}
