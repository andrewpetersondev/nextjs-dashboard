import type { AppError } from "@/shared/errors/core/app-error.entity";
import { isFormValidationError } from "@/shared/forms/guards/form-result.guard";
import type {
  DenseFieldErrorMap,
  SparseFieldValueMap,
} from "@/shared/forms/types/field-error.value";

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
  if (!isFormValidationError(error)) {
    return;
  }

  const fieldErrors = error.metadata?.fieldErrors;

  if (!fieldErrors || typeof fieldErrors !== "object") {
    return;
  }

  return fieldErrors as DenseFieldErrorMap<T, string>;
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
  const metadata = error?.metadata;

  if (!metadata || typeof metadata !== "object") {
    return;
  }

  const values = (metadata as { values?: SparseFieldValueMap<T, string> })
    .values;

  if (!values || typeof values !== "object") {
    return;
  }

  return values;
};
