import type { FieldError } from "./field-error.types";

/**
 * Sparse map: only errored fields present.
 */
export type SparseFieldErrorMap<T extends string, M> = Partial<
  Readonly<Record<T, FieldError<M>>>
>;

/**
 * Sparse value map: only populated fields present.
 */
export type SparseFieldValueMap<T extends string, V> = Partial<Record<T, V>>;

/**
 * Dense map: all fields present with readonly values.
 */
export type DenseFieldErrorMap<T extends string, M> = Readonly<
  Record<T, readonly M[]>
>;
