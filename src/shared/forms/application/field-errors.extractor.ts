import type { BaseError } from "@/shared/errors/core/base-error";
import type { DenseFieldErrorMap } from "@/shared/forms/domain/error-maps.types";
import { isFormValidationError } from "@/shared/forms/domain/form-guards";

/**
 * Safely extract dense field errors from an BaseError.
 * Returns undefined if not a form validation error.
 *
 * @example
 * const errors = getFieldErrors<'email' | 'password'>(BaseError);
 * if (errors) {
 *   console.log(errors.email); // readonly string[]
 * }
 */
export const getFieldErrors = <Tfieldname extends string>(
  error: BaseError,
): DenseFieldErrorMap<Tfieldname, string> | undefined => {
  if (!isFormValidationError(error)) {
    return;
  }
  const fieldErrors = error?.fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== "object") {
    return;
  }
  return fieldErrors as DenseFieldErrorMap<Tfieldname, string>;
};
