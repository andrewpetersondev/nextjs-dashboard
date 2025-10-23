// File: src/shared/forms/types/form-result.types.ts

import type { ErrorCode } from "@/shared/core/errors/base/error-codes";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { Err, Ok, type Result } from "@/shared/core/result/result";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";
import type { SparseFieldValueMap } from "@/shared/forms/types/sparse.types";

const freeze = <T extends object>(o: T): Readonly<T> => Object.freeze(o);

// SECTION: Interfaces (object shapes)

/**
 * Success payload shape
 */
export interface FormSuccess<TPayload> {
  readonly data: TPayload;
  readonly message: string;
}

/**
 * Validation error shape - now extends AppError.
 */
export interface FormError<
  TFieldName extends string,
  TValueEcho = string,
  TMessage extends string = string,
> extends AppError {
  readonly kind: "validation";
  // Contract: dense map with readonly string[] (may be empty)
  readonly fieldErrors: DenseFieldErrorMap<TFieldName, TMessage>;
  readonly values?: SparseFieldValueMap<TFieldName, TValueEcho>;
}

/**
 * Result for forms (unifies success + validation error).
 */
export type FormResult<
  TFieldName extends string,
  TPayload,
  TValueEcho = string,
  TMessage extends string = string,
> = Result<FormSuccess<TPayload>, FormError<TFieldName, TValueEcho, TMessage>>;

// SECTION: Constructors and guards

export const FormOk = <TFieldName extends string, TPayload>(
  data: TPayload,
  message: string,
): FormResult<TFieldName, TPayload> => {
  const value = freeze<FormSuccess<TPayload>>({ data, message });
  return Ok(value);
};

// Create a FormResult validation error (freezes payload)
export const FormErr = <
  TFieldName extends string,
  TPayload,
  TValueEcho = string,
  TMessage extends string = string,
>(params: {
  readonly code?: ErrorCode;
  readonly fieldErrors: DenseFieldErrorMap<TFieldName, TMessage>;
  readonly message: string;
  readonly values?: SparseFieldValueMap<TFieldName, TValueEcho>;
}): FormResult<TFieldName, TPayload, TValueEcho, TMessage> => {
  const error = freeze<FormError<TFieldName, TValueEcho, TMessage>>({
    code: params.code ?? "VALIDATION",
    fieldErrors: params.fieldErrors,
    kind: "validation" as const,
    message: params.message,
    values: params.values,
  });
  return Err(error);
};

// Narrow to success branch
export const isFormOk = <TFieldName extends string, TPayload>(
  r: FormResult<TFieldName, TPayload>,
): r is Result<FormSuccess<TPayload>, never> => r.ok;

// Narrow to validation error branch
export const isFormErr = <
  TFieldName extends string,
  TPayload,
  TValueEcho = string,
  TMessage extends string = string,
>(
  r: FormResult<TFieldName, TPayload, TValueEcho, TMessage>,
): r is Result<never, FormError<TFieldName, TValueEcho, TMessage>> => !r.ok;

// SECTION: Simple maker (payload-only success)

/**
 * Generates a form error result based on the provided field errors, message, and optional field values.
 *
 * @typeParam TFieldName - Specifies the type of the field names in the form.
 * @typeParam TPayload - Specifies the structure of the additional payload included in the form result.
 * @param params - An object containing `fieldErrors`, `message`, and optional `values`.
 * @returns A `FormResult` object encapsulating the error details and payload.
 * @see {@link FormErr} for base implementation details.
 */
export const formErrStrings = <TFieldName extends string, TPayload>(params: {
  readonly fieldErrors: DenseFieldErrorMap<TFieldName, string>;
  readonly message: string;
  readonly values?: SparseFieldValueMap<TFieldName, string>;
}): FormResult<TFieldName, TPayload> =>
  FormErr<TFieldName, TPayload, string, string>(params);
