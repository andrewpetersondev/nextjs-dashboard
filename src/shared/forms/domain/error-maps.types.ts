import type { FieldError } from "./field-error.types";

/**
 * Sparse map: only errored fields present.
 */
export type SparseFieldErrorMap<Tfield extends string, Tmsg> = Partial<
  Readonly<Record<Tfield, FieldError<Tmsg>>>
>;

/**
 * Sparse value map: only populated fields present.
 */
export type SparseFieldValueMap<Tfield extends string, Tvalue> = Partial<
  Record<Tfield, Tvalue>
>;

/**
 * Dense map: all fields present with readonly values.
 */
export type DenseFieldErrorMap<Tfield extends string, Tmsg> = Readonly<
  Record<Tfield, readonly Tmsg[]>
>;
