/**
 * @file Shared TypeScript types describing form values, errors, and form state.
 *
 * Key design rules
 * - Dense maps: every field key is present (fields without errors → `[]`).
 * - Sparse maps: only keys with errors are present; values are guaranteed non-empty arrays.
 * - Do not rely on runtime checks to enforce compile-time readonlyness.
 *
 * @remarks
 * - Prefer string-literal unions for field-name definitions for type safety.
 * - Keep sensitive values out of failure states when echoing form values.
 */

/* -------------------------------------------------------------------------- */
/* Core Types                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Non-empty readonly array.
 *
 * Use this when you want a compile-time guarantee that an array has at least one element.
 *
 * @typeParam T - element type
 */
export type NonEmptyReadonlyArray<T> = readonly [T, ...(readonly T[])];

/**
 * Field-level error: non-empty readonly array of messages.
 *
 * Use this type for sparse maps where existence implies at least one error.
 *
 * @typeParam TMsg - message type (default: string).
 */
export type FieldError<TMsg = string> = NonEmptyReadonlyArray<TMsg>;

/**
 * Runtime check for a non-empty array (FieldError).
 *
 * @remarks
 * - This only verifies "non-empty" at runtime. It **does not** (and cannot) verify
 *   readonlyness or tuple shape. Mutable arrays that happen to be non-empty will pass.
 */
export function isFieldError<TMsg = string>(
  value: readonly TMsg[] | undefined | null,
): value is NonEmptyReadonlyArray<TMsg> {
  return Array.isArray(value) && value.length > 0;
}

/* -------------------------------------------------------------------------- */
/* Maps                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Sparse map of form values: keys may be omitted (fields that were not submitted/are not present).
 *
 * @typeParam TField - string-literal union of field names (required).
 * @typeParam TValue - raw value type for fields (default: string).
 */
export type SparseFormValueMap<
  TField extends string,
  TValue = string,
> = Partial<Record<TField, TValue>>;

/**
 * Sparse error map.
 *
 * - Only includes fields that have at least one error.
 * - Each present key maps to a non-empty readonly array (`FieldError`).
 *
 * @typeParam TField - string-literal union of field names (required).
 * @typeParam TMsg - message type (default: string).
 */
export type SparseErrorMap<TField extends string, TMsg = string> = Partial<
  Readonly<Record<TField, FieldError<TMsg>>>
>;

/**
 * Helper: readonly record keyed by the full set of fields.
 *
 * @typeParam K - string-literal union of keys
 * @typeParam V - value type
 */
export type DenseReadonlyRecord<K extends string, V> = Readonly<Record<K, V>>;

/**
 * Dense error map.
 *
 * - Every key from `TField` must be present.
 * - If a field has no errors, its value must be the (possibly empty) readonly array `[]`.
 *
 * @typeParam TField - string-literal union of field names (required).
 * @typeParam TMsg - message type (default: string).
 */
export type DenseErrorMap<
  TField extends string,
  TMsg = string,
> = DenseReadonlyRecord<TField, readonly TMsg[]>;

/* -------------------------------------------------------------------------- */
/* Form state                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Successful form state.
 *
 * - `errors` and `values` are omitted (set to `never` to aid IDE autocomplete and safety).
 * - `message` is optional (success may not always carry a friendly message).
 *
 * @typeParam TData - validated form data shape (required).
 */
export interface FormStateSuccess<TData = unknown> {
  readonly data: TData;
  readonly errors?: never;
  readonly message?: string;
  readonly success: true;
  readonly values?: never;
}

/**
 * Failed form state.
 *
 * - `errors` here is the **dense** error map (every field present).
 * - `values` is sparse: present only for fields the caller wants to echo back (avoid sensitive fields).
 *
 * @typeParam TField - string-literal union of field names (required).
 * @typeParam TValue - raw form value type (default: string).
 * @typeParam TMsg - message type (default: string).
 */
export interface FormStateFailure<
  TField extends string,
  TValue = string,
  TMsg = string,
> {
  readonly errors: DenseErrorMap<TField, TMsg>;
  readonly message: string;
  readonly success: false;
  readonly values?: SparseFormValueMap<TField, TValue>;
}

/**
 * Complete form state union.
 *
 * @typeParam TField - string-literal union of field names (required).
 * @typeParam TData - validated data on success (default: unknown).
 * @typeParam TValue - raw value type (default: string).
 * @typeParam TMsg - message type for field errors (default: string).
 */
export type FormState<
  TField extends string,
  TData = unknown,
  TValue = string,
  TMsg = string,
> = FormStateSuccess<TData> | FormStateFailure<TField, TValue, TMsg>;
