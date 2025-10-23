/**
 * src/shared/forms/core/types.ts
 *
 * NonEmptyReadonlyArray = array with at least one element
 * FieldError = array with at least one element
 * isNonEmptyArray = predicate
 */

import type { ErrorCode } from "@/shared/core/errors/base/error-codes";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { Err, Ok, type Result } from "@/shared/core/result/result";
import type { DenseFieldErrorMap } from "@/shared/forms/errors/types/dense.types";
import type { SparseFieldValueMap } from "@/shared/forms/errors/types/sparse.types";

const freeze = <T extends object>(o: T): Readonly<T> => Object.freeze(o);

/**
 * Array that is guaranteed to contain at least one element.
 * - falsy values are allowed
 * - nullish values are allowed (but considered bad practice)
 * @typeParam TElement - The type of elements in the array.
 * @example
 * const example: NonEmptyArray<string> = ["", ""]; // valid falsy example
 * const example: NonEmptyArray<string[]> = [[],[]]; // valid falsy example
 * const example: NonEmptyArray<number> = [1, 2, 3];
 * const example: NonEmptyArray<string | null> = [null, null]; // valid nullish example
 * @readonly
 */
export type NonEmptyArray<TElement> = readonly [
  TElement,
  ...(readonly TElement[]),
];

/**
 * Represents an error associated with a field, containing a non-empty, readonly array of messages.
 *
 * NOTE: Keep for internal checks, but UI contract will use readonly string[] (can be empty) via DenseFieldErrorMap.
 */
export type FieldError<TMsg = string> = NonEmptyArray<TMsg>;

/**
 * Determines if the provided value is a non-empty readonly array.
 *
 * @param arr - The array to check, which can be a readonly array, null, or undefined.
 * @returns A boolean indicating whether the input is a non-empty readonly array.
 * @example
 * isNonEmptyArray([1, 2, 3]); // true
 * isNonEmptyArray([[]]); // true
 * isNonEmptyArray([""]); // true
 * isNonEmptyArray([]); // false
 * isNonEmptyArray([], []); // false
 * isNonEmptyArray(null); // false
 */
export function isNonEmptyArray<T>(
  arr: readonly T[] | null | undefined,
): arr is NonEmptyArray<T> {
  // Avoids mutating or widening; purely a predicate
  return Array.isArray(arr) && arr.length > 0;
}

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
export const formOk = <TFieldName extends string, TPayload>(
  data: TPayload,
  message: string,
): FormResult<TFieldName, TPayload> => {
  const value = freeze<FormSuccess<TPayload>>({ data, message });
  return Ok(value);
};

// Create a FormResult validation error (freezes payload)
export const formError = <
  TFieldName extends string,
  TPayload = never,
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

/**
 * Generates a form error result based on the provided field errors, message, and optional field values.
 *
 * @typeParam TFieldName - Specifies the type of the field names in the form.
 * @typeParam TPayload - Specifies the structure of the additional payload included in the form result.
 * @param params - An object containing `fieldErrors`, `message`, and optional `values`.
 * @returns A `FormResult` object encapsulating the error details and payload.
 * @see {@link formError} for base implementation details.
 */
export const createFormErrorWithStrings = <
  TFieldName extends string,
  TPayload,
>(params: {
  readonly fieldErrors: DenseFieldErrorMap<TFieldName, string>;
  readonly message: string;
  readonly values?: SparseFieldValueMap<TFieldName, string>;
}): FormResult<TFieldName, TPayload> =>
  formError<TFieldName, TPayload, string, string>(params);
