import type { DenseFieldErrorMap } from "@/shared/forms/core/types/field-error.value";

/**
 * Creates an empty dense error map (all fields present with empty arrays).
 *
 * @typeParam T - Field name literal union.
 * @typeParam M - Error message string type.
 * @param fields - Array of allowed field names.
 * @returns A frozen {@link DenseFieldErrorMap} with each field mapped to an empty array.
 */
export function makeEmptyDenseFieldErrorMap<T extends string, M extends string>(
  fields: readonly T[],
): DenseFieldErrorMap<T, M> {
  const result = {} as Record<T, readonly M[]>;

  for (const field of fields) {
    result[field] = Object.freeze([]);
  }

  return Object.freeze(result);
}
