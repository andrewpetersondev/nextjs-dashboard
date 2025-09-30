import type {
  DenseReadonlyRecord,
  NonEmptyReadonlyArray,
} from "@/shared/forms/types/core-types.util";

/**
 * Field-level error: non-empty readonly array of messages.
 *
 * Use this type for sparse maps where existence implies at least one error.
 *
 * @typeParam TMsg - message type (default: string).
 */
export type FieldError<TMsg = string> = NonEmptyReadonlyArray<TMsg>;
/**
 * Sparse error map.
 *
 * - Only includes fields that have at least one error.
 * - Each present key maps to a non-empty readonly array (`FieldError`).
 *
 * @typeParam TField - string-literal union of field names (required).
 * @typeParam TMsg - message type (default: string).
 */
export type SparseFieldErrorMap<TField extends string, TMsg = string> = Partial<
  Readonly<Record<TField, FieldError<TMsg>>>
>;
/**
 * Dense error map.
 *
 * - Every key from `TField` must be present.
 * - If a field has no errors, its value must be the (possibly empty) readonly array `[]`.
 *
 * @typeParam TField - string-literal union of field names (required).
 * @typeParam TMsg - message type (default: string).
 */
export type DenseFieldErrorMap<
  TField extends string,
  TMsg = string,
> = DenseReadonlyRecord<TField, readonly TMsg[]>;
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
