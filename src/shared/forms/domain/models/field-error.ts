/**
 * Domain models for field-level errors.
 * Framework-agnostic.
 */

/**
 * Array that is guaranteed to contain at least one element.
 */
export type NonEmptyArray<TElement> = readonly [
  TElement,
  ...(readonly TElement[]),
];

/**
 * Represents an error associated with a field.
 */
export type FieldError<TMsg = string> = NonEmptyArray<TMsg>;

/**
 * Type guard: determines if value is a non-empty readonly array.
 */
export function isNonEmptyArray<T>(
  arr: readonly T[] | null | undefined,
): arr is NonEmptyArray<T> {
  return Array.isArray(arr) && arr.length > 0;
}
