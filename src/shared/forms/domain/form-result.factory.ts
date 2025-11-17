// src/shared/forms/domain/factories/form-result.factory.ts

import {
  type AppError,
  makeAppErrorDetails,
} from "@/shared/errors/app-error/app-error";
import type { ErrorCode } from "@/shared/errors/error-codes";
import type {
  DenseFieldErrorMap,
  SparseFieldValueMap,
} from "@/shared/forms/domain/error-maps.types";
import type {
  FormResult,
  FormSuccess,
} from "@/shared/forms/domain/form-result.types";
import { Err, Ok } from "@/shared/result/result";
import { freeze } from "@/shared/utils/object/freeze";

/**
 * Create a successful form result.
 *
 * @typeParam Tpayload - Payload type carried by the success result.
 * @param data - The payload value.
 * @param message - Human-readable success message.
 * @returns A frozen {@link FormResult} containing an {@link FormSuccess} with the given data and message.
 */
export const formOk = <Tpayload>(
  data: Tpayload,
  message: string,
): FormResult<Tpayload> => {
  const value = freeze<FormSuccess<Tpayload>>({ data, message });
  return Ok(value);
};

/**
 * Create a form validation error with a dense field error map.
 *
 * @typeParam Tfieldname - Type for field name keys present in `fieldErrors`.
 * @param params - Error construction parameters.
 * @param params.code - Optional error code; defaults to `"validation"`.
 * @param params.message - Top-level error message.
 * @param params.formErrors - Optional global form-level errors.
 * @param params.fieldErrors - Dense map of per-field error messages.
 * @param params.values - Optional sparse map of submitted values to include in details.
 * @returns A frozen {@link FormResult} representing an error (`Err`) containing an {@link AppError}.
 */
export const formError = <Tfieldname extends string>(params: {
  readonly code?: ErrorCode;
  readonly message: string;
  readonly formErrors?: readonly string[];
  readonly fieldErrors: DenseFieldErrorMap<Tfieldname, string>;
  readonly values?: SparseFieldValueMap<Tfieldname, string>;
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
