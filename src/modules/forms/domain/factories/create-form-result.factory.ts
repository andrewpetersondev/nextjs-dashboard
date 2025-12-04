/**
 * Factories for creating form results and form errors.
 */

import type {
  DenseFieldErrorMap,
  SparseFieldValueMap,
} from "@/modules/forms/domain/types/error-maps.types";
import type {
  FormResult,
  FormSuccess,
} from "@/modules/forms/domain/types/form-result.types";
import type { AppError } from "@/shared/errors/core/app-error.class";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import type { AppErrorKey } from "@/shared/errors/registries/error-code.registry";
import { Err, Ok } from "@/shared/result/result";

const freeze = <T extends object>(o: T): Readonly<T> => Object.freeze(o);

/**
 * Create a successful form result.
 *
 * @typeParam T - Payload type carried by the success result.
 * @param data - The payload value.
 * @param message - Human-readable success message.
 * @returns A frozen {@link FormResult} containing an {@link FormSuccess} with the given data and message.
 */
export const formOk = <T>(data: T, message: string): FormResult<T> => {
  const value = freeze<FormSuccess<T>>({ data, message });
  return Ok(value);
};

/**
 * Create a form validation error with a dense field error map.
 *
 * @typeParam F - Type for field name keys present in `fieldErrors`.
 * @param params - Error construction parameters.
 * @param params.code - Optional error code; defaults to `"validation"`.
 * @param params.fieldErrors - Dense map of per-field error messages.
 * @param params.formErrors - Optional global form-level errors.
 * @param params.message - Top-level error message.
 * @param params.values - Optional sparse map of submitted values to include in context.
 * @returns A frozen {@link FormResult} representing an error (`Err`) containing a {@link AppError}.
 */
export const formError = <F extends string>(params: {
  readonly code?: AppErrorKey;
  readonly fieldErrors: DenseFieldErrorMap<F, string>;
  readonly formErrors?: readonly string[];
  readonly message: string;
  readonly values?: SparseFieldValueMap<F, string>;
}): FormResult<never> => {
  const error: AppError = makeAppError(params.code ?? "validation", {
    message: params.message,
    metadata: {
      fieldErrors: params.fieldErrors,
      ...(params.formErrors && { formErrors: params.formErrors }),
      ...(params.values && { values: params.values }),
    },
  });

  return Err(error);
};
