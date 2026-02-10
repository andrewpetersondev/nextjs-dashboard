/**
 * A sparse map of field values, where only fields with values are present.
 *
 * @typeParam T - Field name keys.
 * @typeParam V - Value type.
 */
export type SparseFieldValueMap<T extends string, V> = Readonly<
  Partial<Record<T, V>>
>;
