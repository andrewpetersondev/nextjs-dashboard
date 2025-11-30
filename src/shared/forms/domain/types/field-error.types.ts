/**
 * Array that is guaranteed to contain at least one element.
 *
 * @typeParam T - The type of elements in the array.
 */
export type NonEmptyArray<T> = readonly [T, ...(readonly T[])];

/**
 * Represents an error associated with a field as a non-empty array of messages.
 *
 * @typeParam T - The type of error message, defaults to string.
 */
export type FieldError<T = string> = NonEmptyArray<T>;

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

/**
 * Represents all field errors in a form, mapping field names to arrays of error messages.
 */
export type FieldErrors = Readonly<Record<string, readonly string[]>>;

/**
 * Represents general form-level errors as an array of strings.
 */
export type FormErrors = readonly string[];
