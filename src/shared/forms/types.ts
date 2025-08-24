// Utility types

/**
 * A union helper representing a string-literal union for field names.
 * This is just an alias for documentation/readability.
 */
export type FormFieldName = string;

/** Human-readable error message for a field validation issue. */
export type ErrorMessage = string;

/** A reusable helper for non-empty readonly arrays. */
export type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];

/**
 * Convenience alias for form values used to repopulate inputs on failure.
 * Sensitive fields should be omitted.
 */
export type FormValues<TFieldNames extends FormFieldName> = Partial<
  Record<TFieldNames, FormFieldName>
>;

/**
 * Dense form errors where each field is present and mapped to a readonly error list.
 * Useful for APIs that expect all fields enumerated.
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
 * - If the field has no errors, the property should be omitted in `FormErrors` (sparse map).
 */
export type FormFieldError = NonEmptyReadonlyArray<ErrorMessage>;

/**
 * Maps form field names to their validation errors.
 *
 * @template TFieldNames - String literal union of valid field names.
 *
 * Only fields with errors should be present for clarity and efficiency.
 * Compatible with `exactOptionalPropertyTypes: true`—omitted fields are truly optional.
 */
export type FormErrors<TFieldNames extends FormFieldName> = Partial<
  Record<TFieldNames, FormFieldError>
>;

/**
 * Successful form state with validated data.
 */
export type FormStateSuccess<TData = unknown> = {
  data: TData;
  errors?: never;
  message: string;
  success: true;
};

/**
 * Failed form state with field-level errors and (optionally redacted) raw values.
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
 * On failure, include raw input `values` for repopulating the form.
 * Avoid returning sensitive fields (e.g., passwords) in `values`.
 */
export type FormState<TFieldNames extends string, TData = unknown> =
  | FormStateSuccess<TData>
  | FormStateFailure<TFieldNames>;
