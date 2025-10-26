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
  TField extends string,
  TMsg extends string,
>(fields: readonly TField[]): DenseFieldErrorMap<TField, TMsg> {
  const result: Partial<Record<TField, readonly TMsg[]>> = {};
  for (const f of fields) {
    result[f] = Object.freeze([]) as readonly TMsg[];
  }
  return Object.freeze(result) as DenseFieldErrorMap<TField, TMsg>;
}

/**
 * Converts sparse error map to dense (adds missing fields as empty arrays).
 */
export function toDenseFieldErrorMap<
  TField extends string,
  TMsg extends string,
>(
  sparse: SparseFieldErrorMap<TField, TMsg> | undefined,
  fields: readonly TField[],
): DenseFieldErrorMap<TField, TMsg> {
  const out: Partial<Record<TField, readonly TMsg[]>> = {};
  for (const f of fields) {
    const v = sparse?.[f] as readonly TMsg[] | undefined;
    out[f] = Array.isArray(v)
      ? (Object.freeze([...v]) as readonly TMsg[])
      : (Object.freeze([]) as readonly TMsg[]);
  }
  return Object.freeze(out) as DenseFieldErrorMap<TField, TMsg>;
}

/**
 * Filters error map to allowed fields with non-empty errors.
 */
export function selectSparseFieldErrors<
  TFieldNames extends string,
  TMsg extends string,
>(
  fieldErrors:
    | Partial<Record<TFieldNames, readonly TMsg[] | undefined>>
    | Record<string, readonly TMsg[] | undefined>,
  allowedFields: readonly TFieldNames[],
): SparseFieldErrorMap<TFieldNames, TMsg> {
  const errors: SparseFieldErrorMap<TFieldNames, TMsg> = {};
  for (const key of allowedFields) {
    const maybeErrors = (
      fieldErrors as Record<string, readonly TMsg[] | undefined>
    )[key];
    if (isNonEmptyArray(maybeErrors)) {
      errors[key] = Object.freeze([
        ...maybeErrors,
      ]) as unknown as FieldError<TMsg>;
    }
  }
  return Object.freeze(errors) as SparseFieldErrorMap<TFieldNames, TMsg>;
}
