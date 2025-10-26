import type { AppError } from "@/shared/core/result/app-error/app-error";
import type { Result } from "@/shared/core/result/result";
import type {
  DenseFieldErrorMap,
  SparseFieldValueMap,
} from "@/shared/forms/domain/models/error-maps";
import type {
  FormResult,
  FormSuccess,
} from "@/shared/forms/domain/models/form-result";

/**
 * Narrow to success branch.
 */
export const isFormOk = <TPayload>(
  r: FormResult<TPayload>,
): r is Result<FormSuccess<TPayload>, never> => r.ok;

/**
 * Narrow to validation error branch.
 */
export const isFormErr = <TPayload>(
  r: FormResult<TPayload>,
): r is Result<never, AppError> => !r.ok;

/**
 * Type guard to check if an AppError contains form validation details.
 */
export const isFormValidationError = (error: AppError): boolean =>
  error.kind === "validation" && error.details?.fieldErrors !== undefined;

/**
 * Safely extract dense field errors from an AppError.
 * Returns undefined if not a form validation error.
 *
 * @example
 * const errors = getFieldErrors<'email' | 'password'>(appError);
 * if (errors) {
 *   console.log(errors.email); // readonly string[]
 * }
 */
export const getFieldErrors = <TFieldName extends string>(
  error: AppError,
): DenseFieldErrorMap<TFieldName, string> | undefined => {
  if (!isFormValidationError(error)) {
    return;
  }
  const fieldErrors = error.details?.fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== "object") {
    return;
  }
  return fieldErrors as DenseFieldErrorMap<TFieldName, string>;
};

/**
 * Safely extract form-level errors (non-field errors) from an AppError.
 * Returns undefined if not present.
 */
export const getFormErrors = (error: AppError): readonly string[] | undefined =>
  error.details?.formErrors;

/**
 * Safely extract echoed field values from an AppError.
 * Returns undefined if not present.
 *
 * @example
 * const values = getFieldValues<'email' | 'username'>(appError);
 * if (values?.email) {
 *   console.log(values.email); // string
 * }
 */
export const getFieldValues = <TFieldName extends string>(
  error: AppError,
): SparseFieldValueMap<TFieldName, string> | undefined => {
  const extra = error.details?.extra;
  if (!extra || typeof extra !== "object") {
    return;
  }
  const values = (extra as { values?: SparseFieldValueMap<TFieldName, string> })
    .values;
  if (!values || typeof values !== "object") {
    return;
  }
  return values;
};
