/**
 * @file Shared TypeScript types describing form values, errors, and state.
 * These types are consumed by server actions and UI adapters.
 *
 * @remarks
 * Prefer documenting all types and generics with TSDoc and keep field-name unions as string literals for flexibility.
 */

/**
 * A union helper representing a string-literal union for field names.
 *
 * @remarks
 * Alias provided for readability in generic type parameters.
 */
export type FormFieldName = string;

/** Human-readable error message for a field validation issue. */
export type ErrorMessage = string;

/**
 * A reusable helper for non-empty readonly arrays.
 *
 * @typeParam T - Element type.
 */
export type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];

/**
 * Convenience alias for form values used to repopulate inputs on failure.
 * Sensitive fields should be omitted.
 *
 * @typeParam TFieldNames - String literal union of the form's field names.
 */
export type FormValues<TFieldNames extends FormFieldName> = Partial<
  Record<TFieldNames, FormFieldName>
>;

/**
 * Dense form errors where each field is present and mapped to a readonly error list.
 * Useful for APIs that expect all fields enumerated.
 *
 * @typeParam TFieldNames - String literal union of the form's field names.
 */
export type DenseFormErrors<TFieldNames extends FormFieldName> = Readonly<
  Record<TFieldNames, readonly ErrorMessage[]>
>;

/**
 * Map field names to validation error messages.
 *
 * Represents validation errors where each field is associated with multiple error strings.
 *
 * @remarks
 * Each key in the record corresponds to a field name, and the value is a readonly array of error messages related to that field.
 * This structure is often used in form validation or API responses to convey field-specific errors.
 */
export type FieldErrors = Readonly<
  Record<FormFieldName, readonly ErrorMessage[]>
>;

/**
 * Represents validation errors for a single form field.
 *
 * - If the field has errors, this is a non-empty readonly array of error messages.
 * - If the field has no errors, the property should be omitted in {@link FormErrors} (sparse map).
 */
export type FormFieldError = NonEmptyReadonlyArray<ErrorMessage>;

/**
 * Maps form field names to their validation errors.
 *
 * Only fields with errors should be present for clarity and efficiency.
 *
 * @typeParam TFieldNames - String literal union of valid field names.
 */
export type FormErrors<TFieldNames extends FormFieldName> = Partial<
  Record<TFieldNames, FormFieldError>
>;

/**
 * Successful form state with validated data.
 *
 * @typeParam TData - The validated data type on success.
 * @property data - The validated payload.
 * @property message - A human-readable success message.
 * @property success - Discriminator flag set to `true`.
 */
export type FormStateSuccess<TData = unknown> = {
  data: TData;
  errors?: never;
  message: string;
  success: true;
};

/**
 * Failed form state with field-level errors and (optionally redacted) raw values.
 *
 * @typeParam TFieldNames - String literal union of valid field names.
 * @property errors - Sparse error map containing only fields that have errors.
 * @property message - A human-readable failure message.
 * @property success - Discriminator flag set to `false`.
 * @property values - Optional user-displayable values used to repopulate the form.
 */
export type FormStateFailure<TFieldNames extends string> = {
  errors: FormErrors<TFieldNames>;
  message: string;
  success: false;
  values?: FormValues<TFieldNames>;
};

/**
 * Complete state of a form, including errors, messages, success status, and validated data (on success).
 *
 * @remarks
 * On failure, include raw input {@link FormStateFailure["values"] | values} for repopulating the form.
 * Avoid returning sensitive fields (e.g., passwords) in {@link FormStateFailure["values"] | values}.
 *
 * @typeParam TFieldNames - String literal union of valid field names.
 * @typeParam TData - The validated data type on success.
 */
export type FormState<TFieldNames extends string, TData = unknown> =
  | FormStateSuccess<TData>
  | FormStateFailure<TFieldNames>;
