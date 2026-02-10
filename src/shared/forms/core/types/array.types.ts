/**
 * Array that is guaranteed to contain at least one element.
 *
 * @typeParam T - The type of elements in the array.
 */
export type NonEmptyArray<T> = readonly [T, ...(readonly T[])];
