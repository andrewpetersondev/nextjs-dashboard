// Shared form types (client-safe)

export type FieldErrors = Record<string, string[]>;

/**
 * Represents validation errors for a single form field.
 *
 * - If the field has errors, this is a non-empty array of error messages.
 * - If the field has no errors, this is `undefined`.
 *
 * @example
 * const usernameError: FormFieldError = ["Username is required"];
 * const emailError: FormFieldError = undefined;
 *
 * @remarks
 * Use explicit `undefined` for "no errors" to distinguish from an empty array.
 * Error messages should be localized for internationalization and used with ARIA attributes for accessibility.
 */
export type FormFieldError = string[] | undefined;

/**
 * Maps form field names to their validation errors.
 *
 * @template TFieldNames - String literal union of valid field names.
 *
 * @remarks
 * Only fields with errors should be present for clarity and efficiency.
 * Compatible with `exactOptionalPropertyTypes: true`—omitted fields are truly optional.
 *
 * @example
 * type LoginFields = "email" | "password";
 * const errors: FormErrors<LoginFields> = { email: ["Email is required"] };
 */
export type FormErrors<TFieldNames extends string> = Partial<
  Record<TFieldNames, FormFieldError>
>;

/**
 * Complete state of a form, including errors, messages, success status, and validated data (on success).
 *
 * On failure, include raw input `values` for repopulating the form.
 *
 * @remarks
 * - `data` is only present on success and contains validated, typed data.
 * - `values` may be present on failure and should contain non-sensitive raw inputs for convenience.
 * - For security, avoid returning sensitive fields (e.g., passwords) in `values`.
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
