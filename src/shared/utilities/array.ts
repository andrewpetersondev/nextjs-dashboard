import type { NonEmptyArray } from "@/shared/forms/core/types/field-error.value";

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
