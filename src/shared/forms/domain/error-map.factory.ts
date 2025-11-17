// src/shared/forms/domain/factories/error-map.factory.ts
/**
 * Factory functions for creating and transforming error maps.
 * Pure domain logic, no framework dependencies.
 */

import type {
  DenseFieldErrorMap,
  SparseFieldErrorMap,
} from "@/shared/forms/domain/error-maps.types";
import {
  type FieldError,
  isNonEmptyArray,
} from "@/shared/forms/domain/field-error.types";

/**
 * Creates an empty dense error map (all fields present with empty arrays).
 *
 * @typeParam Tfield - Field name literal union.
 * @typeParam Tmsg - Error message string type.
 * @param fields - Array of allowed field names.
 * @returns A frozen {@link DenseFieldErrorMap} with each field mapped to an empty array.
 */
export function createEmptyDenseFieldErrorMap<
  Tfield extends string,
  Tmsg extends string,
>(fields: readonly Tfield[]): DenseFieldErrorMap<Tfield, Tmsg> {
  const result: Partial<Record<Tfield, readonly Tmsg[]>> = {};
  for (const f of fields) {
    result[f] = Object.freeze([]) as readonly Tmsg[];
  }
  return Object.freeze(result) as DenseFieldErrorMap<Tfield, Tmsg>;
}

/**
 * Converts a sparse error map to a dense map by adding missing fields with empty arrays.
 *
 * @typeParam Tfield - Field name literal union.
 * @typeParam Tmsg - Error message string type.
 * @param sparse - Sparse map which may omit some fields.
 * @param fields - Allowed field names to ensure keys for.
 * @returns A frozen {@link DenseFieldErrorMap} with arrays for every allowed field.
 */
export function toDenseFieldErrorMap<
  Tfield extends string,
  Tmsg extends string,
>(
  sparse: SparseFieldErrorMap<Tfield, Tmsg> | undefined,
  fields: readonly Tfield[],
): DenseFieldErrorMap<Tfield, Tmsg> {
  const out: Partial<Record<Tfield, readonly Tmsg[]>> = {};
  for (const f of fields) {
    const v = sparse?.[f] as readonly Tmsg[] | undefined;
    out[f] = Array.isArray(v)
      ? (Object.freeze([...v]) as readonly Tmsg[])
      : (Object.freeze([]) as readonly Tmsg[]);
  }
  return Object.freeze(out) as DenseFieldErrorMap<Tfield, Tmsg>;
}

/**
 * Filters an error map to the allowed fields and keeps only non-empty error arrays.
 *
 * @typeParam Tfieldnames - Allowed field name union.
 * @typeParam Tmsg - Error message string type.
 * @param fieldErrors - Source field errors (sparse or raw record).
 * @param allowedFields - Fields to include in the result.
 * @returns A frozen {@link SparseFieldErrorMap} containing only allowed fields that have non-empty errors.
 */
export function selectSparseFieldErrors<
  Tfieldnames extends string,
  Tmsg extends string,
>(
  fieldErrors:
    | Partial<Record<Tfieldnames, readonly Tmsg[] | undefined>>
    | Record<string, readonly Tmsg[] | undefined>,
  allowedFields: readonly Tfieldnames[],
): SparseFieldErrorMap<Tfieldnames, Tmsg> {
  const errors: SparseFieldErrorMap<Tfieldnames, Tmsg> = {};
  for (const key of allowedFields) {
    const maybeErrors = (
      fieldErrors as Record<string, readonly Tmsg[] | undefined>
    )[key];
    if (isNonEmptyArray(maybeErrors)) {
      errors[key] = Object.freeze([
        ...maybeErrors,
      ]) as unknown as FieldError<Tmsg>;
    }
  }
  return Object.freeze(errors) as SparseFieldErrorMap<Tfieldnames, Tmsg>;
}
