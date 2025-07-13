import "server-only";

/**
 * Represents the validation errors for a single form field.
 *
 * - If the field has validation errors, this will be a non-empty array of error messages.
 * - If the field has no errors, this will be `undefined`.
 *
 * @example
 * // Field with errors
 * const usernameError: FormFieldError = ["Username is required", "Username must be at least 3 characters"];
 *
 * // Field with no errors
 * const emailError: FormFieldError = undefined;
 *
 * @remarks
 * - Use this type to standardize how field-level errors are represented in form state and validation logic.
 * - Always prefer explicit `undefined` for "no errors" to distinguish from an empty array.
 *
 * @see FormErrors for mapping field names to their errors.
 */
export type FormFieldError = string[] | undefined;

/**
 * Represents a mapping of form field names to their respective validation errors.
 *
 * @template T - The string literal union of valid form field names. Defaults to `string` for flexibility, but should be narrowed to specific field names for type safety.
 *
 * @remarks
 * - This type is a `Partial<Record<T, FormFieldError>>`, meaning:
 *   - `Record<T, FormFieldError>` creates an object type where each key is a field name (`T`) and each value is a `FormFieldError` (an array of error messages or `undefined`).
 *   - `Partial<>` makes all properties optional, so only fields with errors need to be present.
 * - This structure allows you to represent only the fields that currently have validation errors, improving efficiency and clarity.
 * - Use this type to standardize error handling in form state, validation logic, and UI error displays.
 *
 * @example
 * // Define specific field names for a login form
 * type LoginFields = "email" | "password";
 *
 * @example
 * // Example usage with errors
 * const errors: FormErrors<LoginFields> = {
 *   email: ["Email is required"],
 *   // password is omitted if there are no errors
 * };
 *
 * @example
 * // Example usage with no errors
 * const noErrors: FormErrors<LoginFields> = {};
 *
 *  @example
 * //`Record<T, FormFieldError>` creates an object type where each key is a field name (`T`) and each value is a `FormFieldError` (an array of error messages or `undefined`).
 *  // Example: Using Record to type a field error map
 *  type FieldErrorMap = Record<"email" | "password", string[] | undefined>;
 *  const errors: FieldErrorMap = {
 *  email: ["Email is required"], // error present
 *      password: undefined, // no error
 *      };
 *
 */
export type FormErrors<T extends string = string> = Partial<
  Record<T, FormFieldError>
>;

/**
 * Represents the complete state of a form, including validation errors, user-facing messages, success status, and optional validated data.
 *
 * @template TFieldNames - The string literal union of valid form field names. Defaults to `string` for flexibility, but should be narrowed to specific field names for type safety.
 * @template TData - The type of validated form data. Defaults to `unknown` for generality, but should be specified for strong typing.
 *
 * @property {FormErrors<TFieldNames>} errors
 *   - Field-level validation errors.
 *   - Keys are field names, values are arrays of error messages or `undefined`.
 *   - Use this to display or process validation errors for individual fields.
 *
 * @property {string} message
 *   - A user-facing message, such as a general error or success notification.
 *   - Intended for display above or below the form, not tied to a specific field.
 *
 * @property {boolean} success
 *   - Indicates if the form action (e.g., submission) was successful.
 *   - Use this to control UI state, such as showing a success message or redirecting the user.
 *
 * @property {TData} [data]
 *   - Optional validated data, present only on successful form submission.
 *   - Use this to access the sanitized and validated form data after a successful operation.
 *
 * @example
 * // Define specific field names for a registration form
 * type RegistrationFields = "email" | "password" | "username";
 *
 * // Example usage with errors
 * const formState: FormState<RegistrationFields, { email: string; password: string; username: string }> = {
 *   errors: {
 *     email: ["Email is required"],
 *     password: ["Password must be at least 8 characters"],
 *   },
 *   message: "Please fix the errors below.",
 *   success: false,
 * };
 *
 * // Example usage on success
 * const successState: FormState<RegistrationFields, { email: string; password: string; username: string }> = {
 *   errors: {},
 *   message: "Registration successful!",
 *   success: true,
 *   data: {
 *     email: "user@example.com",
 *     password: "********",
 *     username: "newuser",
 *   },
 * };
 *
 * @remarks
 * - Always use specific string literal types for `TFieldNames` to ensure type safety and prevent typos.
 * - The `errors` property should only include fields with errors; omit fields with no errors for clarity.
 * - The `data` property is optional and should only be present when the form is successfully validated.
 * - This type is designed for use in form state management, validation logic, and UI error handling in React and Next.js applications.
 *
 * @see FormErrors
 * @see FormFieldError
 */
export type FormState<TFieldNames extends string = string, TData = unknown> = {
  errors: FormErrors<TFieldNames>;
  message: string;
  success: boolean;
  data?: TData;
};
