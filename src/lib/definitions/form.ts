/**
 * Generic form state for any form fields.
 * @template TFieldNames - The string literal union of form field names.
 */
export type FormState<TFieldNames extends string = string> = {
  /**
   * Field-level validation errors.
   * Keys are field names, values are arrays of error messages.
   */
  errors?: FormErrors<TFieldNames>;
  /**
   * Optional user-facing message (success or error).
   */
  message?: string;
  /**
   * Indicates if the form action was successful.
   */
  success?: boolean;
};

/**
 * Standard type for form field errors.
 * Use this type for all error props in form components.
 */
export type FormFieldError = string[] | undefined;

/**
 * Standard type for mapping field names to errors.
 */
export type FormErrors<T extends string = string> = Partial<
  Record<T, FormFieldError>
>;
