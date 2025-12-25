import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import type {
  DenseFieldErrorMap,
  FormErrors,
  FormValidationMetadata,
  SparseFieldValueMap,
} from "@/shared/forms/core/types/field-error.value";
import type {
  FormResult,
  FormSuccessPayload,
} from "@/shared/forms/core/types/form-result.dto";
import { Err, Ok } from "@/shared/result/result";

/**
 * Parameters for creating a form error result.
 */
export interface FormErrorParams<TFields extends string> {
  readonly fieldErrors: DenseFieldErrorMap<TFields, string>;
  readonly formData: SparseFieldValueMap<TFields, string>;
  readonly formErrors: FormErrors;
  readonly key: AppErrorKey;
  readonly message: string;
}

/**
 * Create a form validation error result.
 *
 * @param params - Error construction parameters including fields and form-level errors.
 * @returns A Result containing an AppError with validation metadata.
 */
export const makeFormError = <TFields extends string>(
  params: FormErrorParams<TFields>,
): FormResult<never> => {
  const metadata: FormValidationMetadata<TFields> = Object.freeze({
    fieldErrors: params.fieldErrors,
    formData: params.formData,
    formErrors: params.formErrors,
  });

  return Err(
    makeAppError(params.key, {
      cause: "",
      message: params.message,
      metadata,
    }),
  );
};

/**
 * Create a successful form result.
 *
 * @param data - The payload value to return to the caller.
 * @param message - Human-readable success message for UI feedback.
 * @returns A Result containing the success payload.
 */
export const makeFormOk = <TData>(
  data: TData,
  message: string,
): FormResult<TData> => {
  return Ok(
    Object.freeze({
      data,
      message,
    } satisfies FormSuccessPayload<TData>),
  );
};
