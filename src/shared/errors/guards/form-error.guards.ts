import type { AppError } from "@/shared/errors/core/app-error.class";
import type { FormErrorMetadata } from "@/shared/errors/core/error.types";
import type {
  FieldErrors,
  FormErrors,
} from "@/shared/forms/domain/field-error.types";

/**
 * Type guard to check if error metadata contains form errors.
 *
 * @example
 * if (hasFormErrors(error)) {
 *   console.log(error.metadata.formErrors); // string[]
 * }
 */
export function hasFormErrors(error: AppError): error is AppError & {
  metadata: FormErrorMetadata & { formErrors: FormErrors };
} {
  return (
    error.metadata !== undefined &&
    "formErrors" in error.metadata &&
    Array.isArray(error.metadata.formErrors)
  );
}

/**
 * Type guard to check if error metadata contains field errors.
 *
 * @example
 * if (hasFieldErrors(error)) {
 *   console.log(error.metadata.fieldErrors.email); // string[]
 * }
 */
export function hasFieldErrors(error: AppError): error is AppError & {
  metadata: FormErrorMetadata & { fieldErrors: FieldErrors };
} {
  return (
    error.metadata !== undefined &&
    "fieldErrors" in error.metadata &&
    typeof error.metadata.fieldErrors === "object" &&
    error.metadata.fieldErrors !== null
  );
}

/**
 * Type guard to check if error metadata contains any form validation errors.
 *
 * @example
 * if (isFormValidationError(error)) {
 *   // error has either fieldErrors or formErrors or both
 * }
 */
export function isFormValidationError(
  error: AppError,
): error is AppError & { metadata: FormErrorMetadata } {
  return hasFormErrors(error) || hasFieldErrors(error);
}

/**
 * Safely extract field errors from error metadata.
 * Returns undefined if not present.
 *
 * @example
 * const fieldErrors = getFieldErrors(error);
 * if (fieldErrors) {
 *   console.log(fieldErrors.email); // string[] | undefined
 * }
 */
export function getFieldErrors(error: AppError): FieldErrors | undefined {
  if (!hasFieldErrors(error)) {
    return;
  }
  return error.metadata.fieldErrors;
}

/**
 * Safely extract form errors from error metadata.
 * Returns undefined if not present.
 *
 * @example
 * const formErrors = getFormErrors(error);
 * if (formErrors) {
 *   console.log(formErrors[0]); // string
 * }
 */
export function getFormErrors(error: AppError): FormErrors | undefined {
  if (!hasFormErrors(error)) {
    return;
  }
  return error.metadata.formErrors;
}
