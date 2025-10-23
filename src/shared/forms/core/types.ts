/**
 * src/shared/forms/core/types.ts
 *
 * NonEmptyReadonlyArray = array with at least one element
 * FieldError = array with at least one element
 * isNonEmptyArray = predicate
 */

import type { ErrorCode } from "@/shared/core/errors/base/error-codes";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { makeAppErrorDetails } from "@/shared/core/result/app-error/app-error";
import { Err, Ok, type Result } from "@/shared/core/result/result";
import type {
  DenseFieldErrorMap,
  SparseFieldValueMap,
} from "@/shared/forms/errors/types";

const freeze = <T extends object>(o: T): Readonly<T> => Object.freeze(o);

/**
 * Array that is guaranteed to contain at least one element.
 */
export type NonEmptyArray<TElement> = readonly [
  TElement,
  ...(readonly TElement[]),
];

/**
 * Represents an error associated with a field, containing a non-empty, readonly array of messages.
 */
export type FieldError<TMsg = string> = NonEmptyArray<TMsg>;

/**
 * Determines if the provided value is a non-empty readonly array.
 */
export function isNonEmptyArray<T>(
  arr: readonly T[] | null | undefined,
): arr is NonEmptyArray<T> {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Success payload shape for forms.
 */
export interface FormSuccess<TPayload> {
  readonly data: TPayload;
  readonly message: string;
}

/**
 * Unified Result type for forms - uses standard Result<T, AppError>.
 */
export type FormResult<TPayload> = Result<FormSuccess<TPayload>, AppError>;

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
    code: params.code ?? "VALIDATION",
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
