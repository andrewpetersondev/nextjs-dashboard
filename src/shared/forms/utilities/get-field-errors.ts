import type { AppError } from "@/shared/errors/core/app-error";

import type { DenseFieldErrorMap } from "@/shared/forms/types/form.types";
import { isFormValidationError } from "@/shared/forms/utilities/guards/form-result-guards";

/**
 * Safely extract dense field errors from an AppError.
 * Returns undefined if not a form validation error.
 *
 * @example
 * const errors = getFieldErrors<'email' | 'password'>(AppError);
 * if (errors) {
 *   console.log(errors.email); // readonly string[]
 * }
 */
export const getFieldErrors = <T extends string>(
  error: AppError,
): DenseFieldErrorMap<T, string> | undefined => {
  if (!isFormValidationError(error)) {
    return;
  }

  const fieldErrors = error?.metadata?.fieldErrors;

  if (!fieldErrors || typeof fieldErrors !== "object") {
    return;
  }

  return fieldErrors as DenseFieldErrorMap<T, string>;
};
