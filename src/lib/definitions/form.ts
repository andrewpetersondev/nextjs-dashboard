/**
 * Generic form state for any form fields.
 * @template TFields - The type of form fields.
 */
export type FormState<TFields extends Record<string, unknown>> = {
  /**
   * Field-level validation errors.
   * Keys are field names, values are arrays of error messages.
   */
  errors?: Partial<Record<keyof TFields, string[]>>;
  /**
   * Optional user-facing message (success or error).
   */
  message?: string;
};
