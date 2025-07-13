import "server-only";

/**
 * Field-level validation errors.
 */
export type FormFieldError = string[] | undefined;

export type FormErrors<T extends string = string> = Partial<
  Record<T, FormFieldError>
>;

/**
 * Generic form state for any form fields.
 * @template TFieldNames - The string literal union of form field names.
 * @template TData - The type of validated data (optional).
 */
export type FormState<TFieldNames extends string = string, TData = unknown> = {
  /**
   * Field-level validation errors.
   * Keys are field names, values are arrays of error messages.
   */
  errors: FormErrors<TFieldNames>;
  /**
   * User-facing message (success or error).
   */
  message: string;
  /**
   * Indicates if the form action was successful.
   */
  success: boolean;
  /**
   * Optional validated data (present on success).
   */
  data?: TData;
};

/**
 * Standardized validation result for form data.
 * @template T - The type of validated data.
 */
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors: Record<string, string[]>;
  message: string;
};
