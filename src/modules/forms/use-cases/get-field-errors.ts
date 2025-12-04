import { isFormValidationError } from "@/modules/forms/domain/guards/form-result-guards";
import type { DenseFieldErrorMap } from "@/modules/forms/domain/types/error-maps.types";
import type { AppError } from "@/shared/errors/core/app-error.class";

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
