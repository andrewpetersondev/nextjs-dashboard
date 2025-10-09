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
 * Represents a dense map where keys are strings and values are of a specified type.
 *
 * @typeParam TKey - The type of the keys, constrained to `string`.
 * @typeParam TValue - The type of the values in the map.
 * @public
 * @example
 * const map: DenseMap<'a' | 'b', number> = { a: 1, b: 2 };
 */
export type DenseMap<TKey extends string, TValue> = Readonly<
  Record<TKey, TValue>
>;

/**
 * Determines if the provided value is a non-empty readonly array.
 *
 * @param arr - The array to check, which can be a readonly array, null, or undefined.
 * @returns A boolean indicating whether the input is a non-empty readonly array.
 * @example
 * ```ts
 * isNonEmptyArray([1, 2, 3]); // true
 * isNonEmptyArray([]);       // false
 * isNonEmptyArray(null);     // false
 * ```
 */
export function isNonEmptyArray<T>(
  arr: readonly T[] | null | undefined,
): arr is NonEmptyReadonlyArray<T> {
  // Avoids mutating or widening; purely a predicate
  return Array.isArray(arr) && arr.length > 0;
}
