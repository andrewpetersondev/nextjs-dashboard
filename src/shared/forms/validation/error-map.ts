import { type FieldError, isNonEmptyArray } from "@/shared/forms/core/types";
import type {
  DenseFieldErrorMap,
  SparseFieldErrorMap,
} from "@/shared/forms/errors/types";

/**
 * Build a sparse error map restricted to allowed fields.
 *
 * Keeps only fields present in allowedFields and with non-empty errors.
 *
 * @typeParam TFieldNames - String-literal union of allowed field names.
 * @typeParam TMsg - Message type.
 * @param fieldErrors - Source errors keyed by field; values may be undefined.
 * @param allowedFields - Field names to include.
 * @returns Sparse error map with only allowed fields that have errors.
 */
export function selectSparseFieldErrorsForAllowedFields<
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
      // freeze the array to enforce immutability contract
      errors[key] = Object.freeze([
        ...maybeErrors,
      ]) as unknown as FieldError<TMsg>;
    }
  }
  return Object.freeze(errors) as SparseFieldErrorMap<TFieldNames, TMsg>;
}

/**
 * Create an *empty* dense error map for the given fields (every key present, all `[]` and frozen).
 *
 * Useful when you need a canonical dense shape (e.g., initial UI state).
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
 * Convert a sparse error map (only errored keys present) into a dense error map.
 *
 * - Keys missing from `sparse` will be set to `[]` (frozen copies).
 * - Preserves the order of `fields` passed in.
 */
export function toDenseFieldErrorMapFromSparse<
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
 * Validate and deep-freeze a dense error map according to the provided field order.
 *
 * - Ensures every key in `fields` exists in `dense`.
 * - Produces a new object with field arrays cloned and frozen; object is frozen too.
 */
export function normalizeAndFreezeDenseFieldErrorMap<
  TField extends string,
  TMsg extends string,
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

/**
 * Create a dense error map with a single message set on a chosen field (defaults to first).
 */
export function setSingleFieldErrorMessage<
  TField extends string,
  TMsg extends string,
>(
  fields: readonly TField[],
  message: TMsg,
  opts?: { field?: TField },
): DenseFieldErrorMap<TField, TMsg> {
  const dense = createEmptyDenseFieldErrorMap<TField, TMsg>(fields);
  const target = opts?.field ?? (fields[0] as TField | undefined);

  if (!target || !fields.includes(target)) {
    return dense;
  }

  const draft = {
    ...dense,
    [target]: Object.freeze([message]) as readonly TMsg[],
  } as Record<TField, readonly TMsg[]>;

  return normalizeAndFreezeDenseFieldErrorMap(fields, draft);
}
