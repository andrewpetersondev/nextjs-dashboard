import type {
  DenseFieldErrorMap,
  FieldError,
  SparseFieldErrorMap,
} from "@/shared/forms/core/types/field-error.types";

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
  if (!sparse) {
    return makeEmptyDenseFieldErrorMap(fields);
  }

  const result = {} as Record<T, readonly M[]>;

  for (const field of fields) {
    const value = sparse[field];

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
 * @param fieldErrors - Source field errors (e.g., from Zod's flattenError).
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

    // Ensure we only include non-empty arrays to satisfy FieldError constraint
    if (Array.isArray(maybeErrors) && maybeErrors.length > 0) {
      result[field] = Object.freeze([
        maybeErrors[0],
        ...maybeErrors.slice(1),
      ]) as FieldError<M>;
    }
  }
  return Object.freeze(result);
}
