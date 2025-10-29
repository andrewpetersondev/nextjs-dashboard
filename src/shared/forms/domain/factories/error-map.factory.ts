/**
 * Factory functions for creating and transforming error maps.
 * Pure domain logic, no framework dependencies.
 */

import type {
  DenseFieldErrorMap,
  SparseFieldErrorMap,
} from "@/shared/forms/domain/models/error-maps";
import {
  type FieldError,
  isNonEmptyArray,
} from "@/shared/forms/domain/models/field-error";

/**
 * Creates an empty dense error map (all fields present with empty arrays).
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
 * Converts sparse error map to dense (adds missing fields as empty arrays).
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
 * Filters error map to allowed fields with non-empty errors.
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
