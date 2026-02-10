import type {
  DenseFieldErrorMap,
  FieldError,
  SparseFieldErrorMap,
} from "@/shared/forms/core/types/field-error.value";
import { isNonEmptyArray } from "@/shared/utilities/array";

/**
 * Converts a sparse error map to a dense map by adding missing fields with empty arrays.
 *
 * @typeParam T - Field name literal union.
 * @typeParam M - Error message string type.
 * @param sparse - Sparse map which may omit some fields.
 * @param fields - Allowed field names to ensure keys for.
 * @returns A frozen {@link DenseFieldErrorMap} with arrays for every allowed field.
 */
export function toDenseFieldErrorMap<T extends string, M extends string>(
  sparse: SparseFieldErrorMap<T, M> | undefined,
  fields: readonly T[],
): DenseFieldErrorMap<T, M> {
  const result = {} as Record<T, readonly M[]>;

  for (const field of fields) {
    const value = sparse?.[field];

    result[field] = Array.isArray(value)
      ? Object.freeze([...value])
      : Object.freeze([]);
  }
  return Object.freeze(result);
}

/**
 * Filters an error map to the allowed fields and keeps only non-empty error arrays.
 *
 * @typeParam T - Allowed field name union.
 * @typeParam M - Error message string type.
 * @param fieldErrors - Source field errors (sparse or raw record).
 * @param allowedFields - Fields to include in the result.
 * @returns A frozen {@link SparseFieldErrorMap} containing only allowed fields that have non-empty errors.
 */
export function selectSparseFieldErrors<T extends string, M extends string>(
  fieldErrors: Record<string, readonly M[] | undefined>,
  allowedFields: readonly T[],
): SparseFieldErrorMap<T, M> {
  const result = {} as Record<T, FieldError<M>>;

  for (const field of allowedFields) {
    const maybeErrors = fieldErrors[field];

    if (isNonEmptyArray(maybeErrors)) {
      result[field] = Object.freeze([...maybeErrors]);
    }
  }
  return Object.freeze(result);
}
