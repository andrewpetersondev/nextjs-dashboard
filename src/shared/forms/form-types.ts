/**
 * @file Shared TypeScript types describing form values, errors, and state.
 *
 * @remarks
 * - Prefer string-literal unions for field-name definitions for type safety.
 * - Keep sensitive values out of failure states when echoing form values.
 */

/* -------------------------------------------------------------------------- */
/* Basic building blocks                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A helper type representing the string-literal union for form field names.
 */
export type FormFieldName = string & { readonly __brand: unique symbol };

/**
 * A type alias representing a human-readable message shown by forms
 * (typically validation errors, but can be adapted).
 */
export type FormMessage = string;

/**
 * A reusable helper type for defining non-empty readonly arrays.
 *
 * @typeParam T - The element type of the array.
 */
export type NonEmptyReadonlyArray<T> = readonly [T, ...(readonly T[])];

/* -------------------------------------------------------------------------- */
/* Form values                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Sparse form values mapped as a partial record of field names to their raw values.
 *
 * @typeParam TField - A string-literal union of the form's field names.
 * @typeParam TValue - The raw value type for fields (defaults to string).
 */
export type FormValueMap<
  TField extends string = FormFieldName,
  TValue = string,
> = Partial<Readonly<Record<TField, TValue>>>;

/* -------------------------------------------------------------------------- */
/* Error maps                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * A readonly record helper for dense maps keyed by all form fields.
 *
 * @typeParam TKey - The key type (string-literal union).
 * @typeParam TValue - The value type.
 */
export type DenseRecordReadonly<TKey extends string, TValue> = Readonly<
  Record<TKey, TValue>
>;

/**
 * Dense form errors where every form field is present and mapped to a readonly array of messages.
 *
 * @typeParam TField - A string-literal union of the form's field names.
 * @typeParam TMsg - The message type (defaults to FormMessage).
 *
 * @remarks
 * - This is the canonical UI shape: all fields present; fields without errors have [].
 */
export type DenseErrorMap<
  TField extends string = FormFieldName,
  TMsg = FormMessage,
> = DenseRecordReadonly<TField, readonly TMsg[]>;

/**
 * Validation errors for a single form field as a non-empty readonly array of messages.
 *
 * @typeParam TMsg - The message type (defaults to FormMessage).
 */
export type FieldError<TMsg = FormMessage> = NonEmptyReadonlyArray<TMsg>;

/**
 * Sparse form errors where only fields with errors are present.
 *
 * @typeParam TField - A string-literal union of valid form field names.
 * @typeParam TMsg - The message type (defaults to FormMessage).
 */
export type SparseErrorMap<
  TField extends string = FormFieldName,
  TMsg = FormMessage,
> = Partial<Readonly<Record<TField, FieldError<TMsg>>>>;

/* -------------------------------------------------------------------------- */
/* Form state                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Represents the successful state of a form submission with validated data.
 *
 * @typeParam TData - The type of validated form data in the successful state.
 *
 * @property data - The validated payload that passed validation.
 * @property message - A human-readable success message, often used for UI feedback.
 * @property success - A flag indicating the successful submission of the form (`true`).
 *
 * @remarks - `errors` and `values` are not present in the successful state. set to `never` for ide type safety.
 */
export interface FormStateSuccess<TData = unknown> {
  readonly data: TData;
  readonly errors?: never;
  readonly message: string;
  readonly success: true;
  readonly values?: never;
}

/**
 * Represents the failed state of a form submission with validation errors.
 *
 * @typeParam TField - A string-literal union of valid form field names.
 * @typeParam TValue - The raw value type for fields (defaults to string).
 * @typeParam TMsg - The message type (defaults to FormMessage).
 *
 * @property errors - A dense error map containing all fields and their associated validation errors.
 * @property message - A human-readable failure message, often used for UI feedback.
 * @property success - A flag indicating the form submission failure (`false`).
 * @property values - Optional raw form values for repopulation, typically excluding sensitive fields like passwords.
 */
export interface FormStateFailure<
  TField extends string = FormFieldName,
  TValue = string,
  TMsg = FormMessage,
> {
  readonly errors: DenseErrorMap<TField, TMsg>;
  readonly message: string;
  readonly success: false;
  readonly values?: FormValueMap<TField, TValue>;
}

/**
 * The complete state of a form, encompassing errors, success status, messages, and validated or raw data.
 *
 * @remarks
 * - On failure, supplement the state with raw form values {@link FormStateFailure.values} for populating the form.
 * - Avoid exposing sensitive fields (e.g., passwords) in {@link FormStateFailure.values}.
 *
 * @typeParam TField - A string-literal union of valid form field names.
 * @typeParam TData - The type of validated form data on success.
 * @typeParam TValue - The raw value type for fields (defaults to string).
 * @typeParam TMsg - The message type (defaults to FormMessage).
 */
export type FormState<
  TField extends string = FormFieldName,
  TData = unknown,
  TValue = string,
  TMsg = FormMessage,
> = FormStateSuccess<TData> | FormStateFailure<TField, TValue, TMsg>;

/* -------------------------------------------------------------------------- */
/* Type Guards                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Type guard for FormStateSuccess.
 * @param state - The form state to check.
 * @returns True if state is FormStateSuccess.
 */
export function isFormStateSuccess<
  TField extends string = FormFieldName,
  TData = unknown,
  TValue = string,
  TMsg = FormMessage,
>(
  state: FormState<TField, TData, TValue, TMsg>,
): state is FormStateSuccess<TData> {
  return state.success === true;
}

/**
 * Type guard for FormStateFailure.
 * @param state - The form state to check.
 * @returns True if state is FormStateFailure.
 */
export function isFormStateFailure<
  TField extends string = FormFieldName,
  TData = unknown,
  TValue = string,
  TMsg = FormMessage,
>(
  state: FormState<TField, TData, TValue, TMsg>,
): state is FormStateFailure<TField, TValue, TMsg> {
  return state.success === false;
}

/**
 * Type guard for FieldError (non-empty readonly array).
 * @param value - The value to check.
 * @returns True if value is a non-empty readonly array.
 */
export function isFieldError<TMsg = FormMessage>(
  value: readonly TMsg[] | undefined,
): value is NonEmptyReadonlyArray<TMsg> {
  return Array.isArray(value) && value.length > 0;
}
