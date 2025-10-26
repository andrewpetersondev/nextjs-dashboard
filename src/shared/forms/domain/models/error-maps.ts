/**
 * Domain types for error map structures.
 * Both sparse (partial) and dense (complete) representations.
 */

import type { FieldError } from "./field-error";

/**
 * Sparse map: only errored fields present.
 */
export type SparseFieldErrorMap<TField extends string, TMsg> = Partial<
  Readonly<Record<TField, FieldError<TMsg>>>
>;

/**
 * Sparse value map: only populated fields present.
 */
export type SparseFieldValueMap<TField extends string, TValue> = Partial<
  Record<TField, TValue>
>;

/**
 * Dense map: all fields present with readonly values.
 */
export type DenseFieldErrorMap<TField extends string, TMsg> = Readonly<
  Record<TField, readonly TMsg[]>
>;
