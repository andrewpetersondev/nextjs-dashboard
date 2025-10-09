/**
 * src/shared/forms/types/core.types.ts
 *
 * NonEmptyReadonlyArray = array with at least one element
 * FieldError = array with at least one element
 * isNonEmptyArray = predicate
 */

/**
 * Represents a readonly array that is guaranteed to contain at least one element.
 *
 * @typeParam TElement - The type of elements in the array.
 * @example
 * const example: NonEmptyReadonlyArray<number> = [1, 2, 3];
 * @readonly
 */
export type NonEmptyReadonlyArray<TElement> = readonly [
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
export type FieldError<TMsg = string> = NonEmptyReadonlyArray<TMsg>;

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
