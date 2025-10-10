/**
 * src/shared/forms/types/core.types.ts
 *
 * NonEmptyReadonlyArray = array with at least one element
 * FieldError = array with at least one element
 * isNonEmptyArray = predicate
 */

/**
 * Array that is guaranteed to contain at least one element.
 * - falsy values are allowed
 * - nullish values are allowed (but considered bad practice)
 * @typeParam TElement - The type of elements in the array.
 * @example
 * const example: NonEmptyArray<string> = ["", ""]; // valid falsy example
 * const example: NonEmptyArray<string[]> = [[],[]]; // valid falsy example
 * const example: NonEmptyArray<number> = [1, 2, 3];
 * const example: NonEmptyArray<string | null> = [null, null]; // valid nullish example
 * @readonly
 */
export type NonEmptyArray<TElement> = readonly [
  TElement,
  ...(readonly TElement[]),
];

/**
 * Represents an error associated with a field, containing a non-empty, readonly array of messages.
 *
 * @typeParam TMsg - The type of the error message, defaulting to `string`.
 * @public
 * @example
 * const error: FieldError = ["Required field", "Invalid format"];
 */
export type FieldError<TMsg = string> = NonEmptyArray<TMsg>;

/**
 * Determines if the provided value is a non-empty readonly array.
 *
 * @param arr - The array to check, which can be a readonly array, null, or undefined.
 * @returns A boolean indicating whether the input is a non-empty readonly array.
 * @example
 * isNonEmptyArray([1, 2, 3]); // true
 * isNonEmptyArray([[]]); // true
 * isNonEmptyArray([""]); // true
 * isNonEmptyArray([]); // false
 * isNonEmptyArray([], []); // false
 * isNonEmptyArray(null); // false
 */
export function isNonEmptyArray<T>(
  arr: readonly T[] | null | undefined,
): arr is NonEmptyArray<T> {
  // Avoids mutating or widening; purely a predicate
  return Array.isArray(arr) && arr.length > 0;
}
