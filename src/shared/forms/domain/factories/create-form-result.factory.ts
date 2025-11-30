import type { AppError } from "@/shared/errors/core/app-error.class";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import type { AppErrorKey } from "@/shared/errors/registry/error-code.registry";
import type {
  DenseFieldErrorMap,
  SparseFieldValueMap,
} from "@/shared/forms/domain/types/error-maps.types";
import type {
  FormResult,
  FormSuccess,
} from "@/shared/forms/domain/types/form-result.types";
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
 * @param params.values - Optional sparse map of submitted values to include in context.
 * @returns A frozen {@link FormResult} representing an error (`Err`) containing a {@link AppError}.
 */
export const formError = <Tfieldname extends string>(params: {
  readonly code?: AppErrorKey;
  readonly fieldErrors: DenseFieldErrorMap<Tfieldname, string>;
  readonly formErrors?: readonly string[];
  readonly message: string;
  readonly values?: SparseFieldValueMap<Tfieldname, string>;
}): FormResult<never> => {
  const error: AppError = makeAppError(params.code ?? "validation", {
    message: params.message,
    // Store form errors in metadata along with submitted values
    metadata: {
      fieldErrors: params.fieldErrors,
      ...(params.formErrors && { formErrors: params.formErrors }),
      ...(params.values && { values: params.values }),
    },
  });
  return Err(error);
};
