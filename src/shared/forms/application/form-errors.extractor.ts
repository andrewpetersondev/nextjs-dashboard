import type { BaseError } from "@/shared/errors/base-error";

/**
 * Safely extract form-level errors (non-field errors) from an BaseError.
 */
export const getFormErrors = (
  error: BaseError,
): readonly string[] | undefined => error.formErrors;
