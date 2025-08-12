import "server-only";

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
 * Complete state of a form, including errors, messages, success status, and optional validated data.
 *
 * @template TFieldNames - String literal union of valid field names.
 * @template TData - Type of validated form data.
 *
 * @property errors - Field-level validation errors. Only present for fields with errors.
 * @property message - General user-facing message (error or success).
 * @property success - Indicates if the form action was successful.
 * @property data - Optional validated data, present only on success.
 *
 * @example
 * type RegistrationFields = "email" | "password";
 * const formState: FormState<RegistrationFields, { email: string; password: string }> = {
 *   errors: { email: ["Email is required"] },
 *   message: "Please fix the errors.",
 *   success: false
 * };
 *
 * @remarks
 * - Use specific string literal types for `TFieldNames` for type safety.
 * - The `data` property is optional and only present when validation succeeds.
 * - Designed for strict TypeScript settings (`exactOptionalPropertyTypes: true`).
 */
export type FormState<TFieldNames extends string, TData = unknown> = {
  errors: FormErrors<TFieldNames>;
  message: string;
  success: boolean;
  data?: TData; // Optional: only present on success
};
