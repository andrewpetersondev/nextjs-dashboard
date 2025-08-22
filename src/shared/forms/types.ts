export type FieldErrors = Record<string, string[]>;

/**
 * Represents validation errors for a single form field.
 *
 * - If the field has errors, this is a non-empty array of error messages.
 * - If the field has no errors, this is `undefined`.
 */
export type FormFieldError = string[] | undefined;

/**
 * Maps form field names to their validation errors.
 *
 * @template TFieldNames - String literal union of valid field names.
 *
 * Only fields with errors should be present for clarity and efficiency.
 * Compatible with `exactOptionalPropertyTypes: true`—omitted fields are truly optional.
 */
export type FormErrors<TFieldNames extends string> = Partial<
  Record<TFieldNames, FormFieldError>
>;

/**
 * Complete state of a form, including errors, messages, success status, and validated data (on success).
 *
 * On failure, include raw input `values` for repopulating the form.
 * Avoid returning sensitive fields (e.g., passwords) in `values`.
 */
export type FormState<TFieldNames extends string, TData = unknown> =
  | {
      data: TData;
      errors?: never;
      message: string;
      success: true;
    }
  | {
      errors: FormErrors<TFieldNames>;
      message: string;
      success: false;
      values?: Partial<Record<TFieldNames, string>>;
    };
