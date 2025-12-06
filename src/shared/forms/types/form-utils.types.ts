/**
 * Array that is guaranteed to contain at least one element.
 *
 * @typeParam T - The type of elements in the array.
 */
export type NonEmptyArray<T> = readonly [T, ...(readonly T[])];

/**
 * Type guard: determines if value is a non-empty readonly array.
 *
 * @param arr - The array to check.
 * @returns True if the array is non-empty, false otherwise.
 */
export function isNonEmptyArray<T>(
  arr: readonly T[] | null | undefined,
): arr is NonEmptyArray<T> {
  return Array.isArray(arr) && arr.length > 0;
}
