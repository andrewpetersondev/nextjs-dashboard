import type { AppError } from "@/shared/errors/app-error/app-error";

/**
 * Safely extract form-level errors (non-field errors) from an AppError.
 * Returns undefined if not present.
 */
export const getFormErrors = (error: AppError): readonly string[] | undefined =>
  error.details?.formErrors;
