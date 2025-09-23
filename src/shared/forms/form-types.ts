/**
 * @file Shared TypeScript types describing form values, errors, and state.
 * These types are consumed by server actions and UI adapters.
 *
 * @remarks
 * - Prefer string-literal unions for field-name definitions for type safety.
 * - Keep sensitive values out of failure states when echoing form values.
 */

/**
 * A helper type representing the string-literal union for form field names.
 *
 * @example
 * type LoginField = "email" | "password"
 */
export type FormFieldName = string;

/**
 * A type alias representing a human-readable message shown by forms
 * (typically validation errors, but can be adapted).
 *
 * @example
 * "Email is required"
 */
export type FormMessage = string;

/**
 * A reusable helper type for defining non-empty readonly arrays.
 *
 * @typeParam T - The element type of the array.
 */
export type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];

/**
 * Sparse form values mapped as a partial record of field names to their raw values.
 *
 * @typeParam TField - A string-literal union of the form's field names.
 * @typeParam TValue - The raw value type for fields (defaults to string).
 *
 * @example
 * type LoginField = "email" | "password"
 * type LoginValues = FormValueMap<LoginField, string>
 */
export type FormValueMap<
  TField extends string = FormFieldName,
  TValue = string,
> = Partial<Record<TField, TValue>>;

/**
 * A readonly record helper for dense maps keyed by all form fields.
 *
 * @remarks
 * Use to build maps like errors per field where every field key is present.
 */
export type ReadonlyDenseRecord<TKey extends string, TValue> = Readonly<
  Record<TKey, TValue>
>;

/**
 * Dense form errors where every form field is present and mapped to a readonly array of messages.
 *
 * @typeParam TField - A string-literal union of the form's field names.
 * @typeParam TMsg - The message type (defaults to FormMessage).
 *
 * @example
 * type LoginErrors = DenseErrorMap<"email" | "password">
 *
 * @remarks
 * - This is the canonical UI shape: all fields present; fields without errors have [].
 */
export type DenseErrorMap<
  TField extends string = FormFieldName,
  TMsg = FormMessage,
> = ReadonlyDenseRecord<TField, readonly TMsg[]>;

/**
 * Dense form errors that allow you to statically guarantee non-empty arrays where present.
 *
 * @remarks
 * Useful when you want to enforce non-empty arrays for fields that have messages,
 * while still permitting an empty array to represent "no errors" for a field.
 *
 * NOTE: This is a looser helper; prefer DenseErrorMap for most flows.
 *
 * @typeParam TField - A string-literal union of the form's field names.
 * @typeParam TMsg - The message type (defaults to FormMessage).
 */
export type DenseNonEmptyErrorMap<
  TField extends string = FormFieldName,
  TMsg = FormMessage,
> = ReadonlyDenseRecord<TField, readonly TMsg[] | NonEmptyReadonlyArray<TMsg>>;

/**
 * An alias for dense error maps keyed by field name.
 *
 * @deprecated Prefer DenseErrorMap for clarity.
 */
export type ErrorMap<
  TField extends string = FormFieldName,
  TMsg = FormMessage,
> = DenseErrorMap<TField, TMsg>;

/**
 * Validation errors for a single form field as a non-empty readonly array of messages.
 *
 * @typeParam TMsg - The message type (defaults to FormMessage).
 *
 * @example
 * type EmailError = FieldError
 */
export type FieldError<TMsg = FormMessage> = NonEmptyReadonlyArray<TMsg>;

/**
 * Sparse form errors where only fields with errors are present.
 *
 * @typeParam TField - A string-literal union of valid form field names.
 * @typeParam TMsg - The message type (defaults to FormMessage).
 *
 * @example
 * type LoginErrors = SparseErrorMap<"email" | "password">
 */
export type SparseErrorMap<
  TField extends string = FormFieldName,
  TMsg = FormMessage,
> = Partial<Record<TField, FieldError<TMsg>>>;

/**
 * Represents the successful state of a form submission with validated data.
 *
 * @typeParam TData - The type of validated form data in the successful state.
 *
 * @property data - The validated payload that passed validation.
 * @property message - A human-readable success message, often used for UI feedback.
 * @property success - A flag indicating the successful submission of the form (`true`).
 */
export type FormStateSuccess<TData = unknown> = {
  data: TData;
  errors?: never;
  message: string;
  success: true;
  values?: never;
};

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
export type FormStateFailure<
  TField extends string = FormFieldName,
  TValue = string,
  TMsg = FormMessage,
> = {
  errors: DenseErrorMap<TField, TMsg>;
  message: string;
  success: false;
  values?: FormValueMap<TField, TValue>;
};

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
