import type { ErrorCode } from "@/shared/core/errors/base/error-codes";
import {
  type AppError,
  makeAppErrorDetails,
} from "@/shared/core/result/app-error/app-error";
import { Err, Ok } from "@/shared/core/result/result";
import type {
  DenseFieldErrorMap,
  SparseFieldValueMap,
} from "@/shared/forms/domain/models/error-maps";
import type {
  FormResult,
  FormSuccess,
} from "@/shared/forms/domain/models/form-result";
import { freeze } from "@/shared/forms/domain/utils/freeze";

/**
 * Create a successful form result.
 */
export const formOk = <TPayload>(
  data: TPayload,
  message: string,
): FormResult<TPayload> => {
  const value = freeze<FormSuccess<TPayload>>({ data, message });
  return Ok(value);
};

/**
 * Create a form validation error with dense field error map.
 * Type parameter TFieldName must match the keys in fieldErrors.
 */
export const formError = <TFieldName extends string>(params: {
  readonly code?: ErrorCode;
  readonly message: string;
  readonly formErrors?: readonly string[];
  readonly fieldErrors: DenseFieldErrorMap<TFieldName, string>;
  readonly values?: SparseFieldValueMap<TFieldName, string>;
}): FormResult<never> => {
  const error: AppError = freeze({
    __appError: "AppError" as const,
    code: params.code ?? "validation",
    details: makeAppErrorDetails({
      extra: params.values ? { values: params.values } : undefined,
      fieldErrors: params.fieldErrors,
      formErrors: params.formErrors,
    }),
    kind: "validation",
    message: params.message,
  });
  return Err(error);
};
