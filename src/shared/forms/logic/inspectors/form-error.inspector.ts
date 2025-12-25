import type { AppError } from "@/shared/errors/core/app-error.entity";
import { isFormValidationError } from "@/shared/forms/core/guards/form-result.guard";
import type {
  DenseFieldErrorMap,
  FormErrors,
  SparseFieldValueMap,
} from "@/shared/forms/core/types/field-error.value";

/**
 * Extracts dense field errors from an AppError.
 * Returns undefined if not a form validation error.
 *
 * @example
 * const errors = getFieldErrors<'email' | 'password'>(AppError);
 * if (errors) {
 *   console.log(errors.email); // readonly string[]
 * }
 */
export const extractFieldErrors = <T extends string>(
  error: AppError,
): DenseFieldErrorMap<T, string> | undefined => {
  if (isFormValidationError<T>(error)) {
    return error.metadata.fieldErrors;
  }

  return;
};

/**
 * Extracts echoed field values from an AppError.
 * Returns undefined if not present.
 *
 * @example
 * const values = getFieldValues<'email' | 'username'>(AppError);
 * if (values?.email) {
 *   console.log(values.email); // string
 * }
 */
export const extractFieldValues = <T extends string>(
  error: AppError,
): SparseFieldValueMap<T, string> | undefined => {
  if (isFormValidationError<T>(error)) {
    return error.metadata.values;
  }

  return;
};

/**
 * Extracts form-level errors from an AppError.
 * Returns empty array if not present.
 */
export const extractFormErrors = (error: AppError): FormErrors => {
  if (isFormValidationError(error)) {
    return error.metadata.formErrors;
  }

  return Object.freeze([]);
};
