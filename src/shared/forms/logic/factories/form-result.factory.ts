import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import type {
  DenseFieldErrorMap,
  SparseFieldValueMap,
} from "@/shared/forms/core/types/field-error.value";
import type {
  FormResult,
  FormSuccessPayload,
} from "@/shared/forms/core/types/form-result.dto";
import { Err, Ok } from "@/shared/result/result";

const freeze = <T extends object>(o: T): Readonly<T> => Object.freeze(o);

/**
 * Create a successful form result.
 *
 * @typeParam T - Payload type carried by the success result.
 * @param data - The payload value.
 * @param message - Human-readable success message.
 * @returns A frozen {@link FormResult} containing an {@link FormSuccessPayload} with the given data and message.
 */
export const makeFormOk = <T>(data: T, message: string): FormResult<T> => {
  const value = freeze<FormSuccessPayload<T>>({ data, message });
  return Ok(value);
};

/**
 * Parameters for creating a form error result.
 *
 * @typeParam F - Type for field name keys present in `fieldErrors`.
 */
export interface FormErrorParams<F extends string> {
  readonly code?: AppErrorKey;
  readonly fieldErrors: DenseFieldErrorMap<F, string>;
  readonly formErrors?: readonly string[];
  readonly message: string;
  readonly values?: SparseFieldValueMap<F, string>;
}

/**
 * Create a form validation error with a dense field error map.
 *
 * @typeParam F - Type for field name keys present in `fieldErrors`.
 * @param params - Error construction parameters.
 * @returns A frozen {@link FormResult} representing an error (`Err`) containing a {@link AppError}.
 */
export const makeFormError = <F extends string>(
  params: FormErrorParams<F>,
): FormResult<never> => {
  const error: AppError = makeAppError(params.code ?? "validation", {
    cause: "",
    message: params.message,
    metadata: {
      fieldErrors: params.fieldErrors,
      formErrors: params.formErrors,
      values: params.values,
    },
  });

  return Err(error);
};
