import {
  type FieldError,
  isNonEmptyArray,
} from "@/shared/forms/types/core.types";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";
import type { SparseFieldErrorMap } from "@/shared/forms/types/sparse.types";

/**
 * Build a sparse error map restricted to allowed fields.
 *
 * Keeps only fields present in allowedFields and with non-empty errors.
 *
 * @typeParam TFieldNames - String-literal union of allowed field names.
 * @typeParam TMsg - Message type (defaults to FormMessage).
 * @param fieldErrors - Source errors keyed by field; values may be undefined.
 * @param allowedFields - Field names to include.
 * @returns Sparse error map with only allowed fields that have errors.
 */
export function selectSparseFieldErrorsForAllowedFields<
  TFieldNames extends string,
  TMsg = string,
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
      errors[key] = maybeErrors as FieldError<TMsg>;
    }
  }
  return errors;
}

/**
 * Create an *empty* dense error map for the given fields (every key present, all `[]` and frozen).
 *
 * Useful when you need a canonical dense shape (e.g., initial UI state).
 */
export function createEmptyDenseFieldErrorMap<
  TField extends string,
  TMsg = string,
>(fields: readonly TField[]): DenseFieldErrorMap<TField, TMsg> {
  const result: Partial<Record<TField, readonly TMsg[]>> = {};
  for (const f of fields) {
    result[f] = Object.freeze([]) as readonly TMsg[];
  }
  return Object.freeze(result) as DenseFieldErrorMap<TField, TMsg>;
}

/**
 * Convert a sparse error map (only errored keys present) into a dense error map.
 *
 * - Keys missing from `sparse` will be set to `[]` (frozen copies).
 * - Preserves the order of `fields` passed in.
 */
export function toDenseFieldErrorMapFromSparse<
  TField extends string,
  TMsg = string,
>(
  sparse: SparseFieldErrorMap<TField, TMsg> | undefined,
  fields: readonly TField[],
): DenseFieldErrorMap<TField, TMsg> {
  const out: Partial<Record<TField, readonly TMsg[]>> = {};
  for (const f of fields) {
    const v = sparse?.[f];
    out[f] = Array.isArray(v)
      ? (Object.freeze([...v]) as readonly TMsg[])
      : (Object.freeze([]) as readonly TMsg[]);
  }
  return Object.freeze(out) as DenseFieldErrorMap<TField, TMsg>;
}

/**
 * Convert a dense error map into a sparse error map (only keys whose array length > 0 are kept).
 *
 * - Fields whose array is `[]` are omitted from the result.
 * - Result uses `FieldError` (non-empty readonly arrays) for values.
 */
export function toSparseFieldErrorMapFromDense<
  TField extends string,
  TMsg = string,
>(dense: DenseFieldErrorMap<TField, TMsg>): SparseFieldErrorMap<TField, TMsg> {
  const out: Partial<Record<TField, FieldError<TMsg>>> = {};
  for (const k of Object.keys(dense) as TField[]) {
    const arr = dense[k];
    if (arr && arr.length > 0) {
      out[k] = arr as FieldError<TMsg>;
    }
  }
  return out as SparseFieldErrorMap<TField, TMsg>;
}

/**
 * Validate and deep-freeze a dense error map according to the provided field order.
 *
 * - Ensures every key in `fields` exists in `dense`.
 * - Produces a new object with field arrays cloned and frozen; object is frozen too.
 */
export function normalizeAndFreezeDenseFieldErrorMap<
  TField extends string,
  TMsg,
>(
  fields: readonly TField[],
  dense: Record<TField, readonly TMsg[]>,
): DenseFieldErrorMap<TField, TMsg> {
  for (const f of fields) {
    if (!Object.hasOwn(dense, f)) {
      throw new Error(`Missing field in dense error map: ${f}`);
    }
    const val = dense[f];
    if (!Array.isArray(val)) {
      throw new Error(`Invalid value for field ${f}`);
    }
  }
  const normalized = Object.fromEntries(
    fields.map((f) => [f, Object.freeze([...(dense[f] as readonly TMsg[])])]),
  ) as Record<TField, readonly TMsg[]>;
  return Object.freeze(normalized) as DenseFieldErrorMap<TField, TMsg>;
}
