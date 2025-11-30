import type { AppError } from "@/shared/errors/app-error";
import type { DenseFieldErrorMap } from "@/shared/forms/domain/error-maps.types";
import { isFormValidationError } from "@/shared/forms/domain/form-guards";

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
export const getFieldErrors = <Tfieldname extends string>(
  error: AppError,
): DenseFieldErrorMap<Tfieldname, string> | undefined => {
  if (!isFormValidationError(error)) {
    return;
  }
  const fieldErrors = error?.metadata?.fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== "object") {
    return;
  }
  return fieldErrors as DenseFieldErrorMap<Tfieldname, string>;
};
