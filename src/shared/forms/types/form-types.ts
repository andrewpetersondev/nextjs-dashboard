/**
 * Non-empty readonly array.
 *
 * Use this when you want a compile-time guarantee that an array has at least one element.
 *
 * @typeParam T - element type
 */
export type NonEmptyReadonlyArray<T> = readonly [T, ...(readonly T[])];

/**
 * Runtime check for a non-empty array (FieldError).
 *
 * @remarks
 * - This only verifies "non-empty" at runtime. It **does not** (and cannot) verify
 *   readonlyness or tuple shape. Mutable arrays that happen to be non-empty will pass.
 */
export function isNonEmptyFieldError<TMsg = string>(
  value: readonly TMsg[] | undefined | null,
): value is NonEmptyReadonlyArray<TMsg> {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Sparse map of form values: keys may be omitted (fields that were not submitted/are not present).
 *
 * @typeParam TField - string-literal union of field names (required).
 * @typeParam TValue - raw value type for fields (default: string).
 */
export type SparseFieldValueMap<
  TField extends string,
  TValue = string,
> = Partial<Record<TField, TValue>>;

/**
 * Helper: readonly record keyed by the full set of fields.
 *
 * @typeParam K - string-literal union of keys
 * @typeParam V - value type
 */
export type DenseReadonlyRecord<K extends string, V> = Readonly<Record<K, V>>;
