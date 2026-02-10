import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { isFormValidationError } from "@/shared/forms/core/guards/form-result.guard";
import type {
  DenseFieldErrorMap,
  FormErrors,
} from "@/shared/forms/core/types/field-error.types";
import type { SparseFieldValueMap } from "@/shared/forms/core/types/field-value.types";
import type { FormErrorPayload } from "@/shared/forms/core/types/form-result.dto";
import type { FormValidationMetadata } from "@/shared/forms/core/types/validation.types";

// Helper internal to the inspector
function hasFormMetadata<T extends string>(
  error: AppError,
): error is AppError & { readonly metadata: FormValidationMetadata<T> } {
  return (
    error.key === APP_ERROR_KEYS.validation ||
    error.key === APP_ERROR_KEYS.conflict
  );
}

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
  if (hasFormMetadata<T>(error)) {
    return error.metadata.fieldErrors;
  }

  return;
};

/**
 * Extracts echoed field values from an AppError.
 * Returns undefined if not present.
 */
export const extractFieldValues = <T extends string>(
  error: AppError,
): SparseFieldValueMap<T, string> | undefined => {
  if (isFormValidationError<T>(error)) {
    return error.metadata.formData;
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

/**
 * Helper to extract form-specific error payload from a generic Result.
 * Essential for UI components to display fieldErrors and formErrors.
 */
export function getFormErrorPayload<F extends string>(
  error: AppError,
): FormErrorPayload<F> {
  const formErrors = extractFormErrors(error);

  return {
    fieldErrors:
      extractFieldErrors<F>(error) ??
      (Object.freeze({}) as DenseFieldErrorMap<F, string>),
    formData: extractFieldValues<F>(error) ?? Object.freeze({}),
    formErrors: formErrors.length > 0 ? formErrors : [error.message],
    message: error.message,
  };
}
