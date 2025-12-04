/**
 * Factories for creating and transforming field error maps.
 */

import type {
  DenseFieldErrorMap,
  SparseFieldErrorMap,
} from "@/shared/forms/types/error-maps.types";
import { isNonEmptyArray } from "@/shared/forms/types/field-error.types";

/**
 * Creates an empty dense error map (all fields present with empty arrays).
 *
 * @typeParam T - Field name literal union.
 * @typeParam M - Error message string type.
 * @param fields - Array of allowed field names.
 * @returns A frozen {@link DenseFieldErrorMap} with each field mapped to an empty array.
 */
export function createEmptyDenseFieldErrorMap<
  T extends string,
  M extends string,
>(fields: readonly T[]): DenseFieldErrorMap<T, M> {
  const result: Partial<Record<T, readonly M[]>> = {};

  for (const field of fields) {
    result[field] = Object.freeze([]) as readonly M[];
  }

  return Object.freeze(result) as DenseFieldErrorMap<T, M>;
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
  const result: Partial<Record<T, readonly M[]>> = {};

  for (const field of fields) {
    const value = sparse?.[field] as readonly M[] | undefined;

    result[field] = Array.isArray(value)
      ? (Object.freeze([...value]) as readonly M[])
      : (Object.freeze([]) as readonly M[]);
  }
  return Object.freeze(result) as DenseFieldErrorMap<T, M>;
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
  fieldErrors:
    | Partial<Record<T, readonly M[] | undefined>>
    | Record<string, readonly M[] | undefined>,
  allowedFields: readonly T[],
): SparseFieldErrorMap<T, M> {
  const result: SparseFieldErrorMap<T, M> = {};

  for (const field of allowedFields) {
    const maybeErrors = (
      fieldErrors as Record<string, readonly M[] | undefined>
    )[field];

    if (isNonEmptyArray(maybeErrors)) {
      result[field] = Object.freeze([...maybeErrors]);
    }
  }
  return Object.freeze(result) as SparseFieldErrorMap<T, M>;
}
