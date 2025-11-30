/**
 * Array that is guaranteed to contain at least one element.
 */
export type NonEmptyArray<T> = readonly [T, ...(readonly T[])];

/**
 * Represents an error associated with a field.
 */
export type FieldError<T = string> = NonEmptyArray<T>;

/**
 * Type guard: determines if value is a non-empty readonly array.
 */
export function isNonEmptyArray<T>(
  arr: readonly T[] | null | undefined,
): arr is NonEmptyArray<T> {
  return Array.isArray(arr) && arr.length > 0;
}

export type FieldErrors = Readonly<Record<string, readonly string[]>>;

export type FormErrors = readonly string[];
