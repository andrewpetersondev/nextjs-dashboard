import { Err, Ok, type Result } from "@/shared/core/result/result";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";

import type { SparseFieldValueMap } from "@/shared/forms/types/sparse.types";

/**
 * @public
 * Represents the success state of a form submission.
 *
 * @typeParam TData - The type of data returned upon form success.
 * @property data - The data resulting from the successful form submission.
 * @property message - An optional success message.
 */
export interface FormSuccess<TData> {
  readonly data: TData;
  readonly message?: string;
}

/**
 * Represents a form validation error with detailed field-specific errors and optional field values.
 *
 * @typeParam TField - The type of field names in the form.
 * @typeParam TValue - The type of field values, defaulting to `string`.
 * @typeParam TMsg - The type of error messages, defaulting to `string`.
 * @public
 * @example
 * const error: FormValidationError<'email'> = {
 *   kind: "validation",
 *   fieldErrors: { email: "Invalid email address" },
 *   message: "Validation failed",
 * };
 */
export interface FormValidationError<
  TField extends string,
  TValue = string,
  TMsg = string,
> {
  readonly kind: "validation";
  // Contract: dense map with readonly string[] (may be empty)
  readonly fieldErrors: DenseFieldErrorMap<TField, readonly TMsg[]>;
  readonly values?: SparseFieldValueMap<TField, TValue>;
  readonly message: string;
}

/**
 * Represents an error in a form field with associated field name, value, and message.
 *
 * @typeParam TField - The type of the field name.
 * @typeParam TValue - The type of the field value. Defaults to `string`.
 * @typeParam TMsg - The type of the error message. Defaults to `string`.
 * @see {@link FormValidationError}
 * @public
 */
export type FormError<
  TField extends string,
  TValue = string,
  TMsg = string,
> = FormValidationError<TField, TValue, TMsg>;

/**
 * @public
 * Represents the result of a form submission, encapsulating success or error states.
 *
 * @typeParam TField - The type of field names in the form.
 * @typeParam TData - The type of data returned upon successful submission.
 * @typeParam TValue - The type of value associated with an error (default: string).
 * @typeParam TMsg - The type of error message (default: string).
 */
export type FormResult<
  TField extends string,
  TData,
  TValue = string,
  TMsg = string,
> = Result<FormSuccess<TData>, FormValidationError<TField, TValue, TMsg>>;

// Add lightweight constructors/guards similar to Result helpers.

// Create a FormResult success
export function FormOk<TField extends string, TData>(
  data: TData,
  message?: string,
): FormResult<TField, TData> {
  return Ok<FormSuccess<TData>>({ data, message });
}

// Create a FormResult validation error
export function FormErr<
  TField extends string,
  TData,
  TValue = string,
  TMsg = string,
>(params: {
  readonly fieldErrors: DenseFieldErrorMap<TField, readonly TMsg[]>;
  readonly message: string;
  readonly values?: SparseFieldValueMap<TField, TValue>;
}): FormResult<TField, TData, TValue, TMsg> {
  const error: FormValidationError<TField, TValue, TMsg> = {
    fieldErrors: params.fieldErrors,
    kind: "validation",
    message: params.message,
    values: params.values,
  };
  return Err<FormSuccess<TData>, FormValidationError<TField, TValue, TMsg>>(
    error,
  );
}

// Narrow to success branch
export function isFormOk<
  TField extends string,
  TData,
  TValue = string,
  TMsg = string,
>(
  r: FormResult<TField, TData, TValue, TMsg>,
): r is Result<FormSuccess<TData>, never> {
  return r.ok;
}

// Narrow to validation error branch
export function isFormErr<
  TField extends string,
  TData,
  TValue = string,
  TMsg = string,
>(
  r: FormResult<TField, TData, TValue, TMsg>,
): r is Result<never, FormValidationError<TField, TValue, TMsg>> {
  return !r.ok;
}

/**
 * Creates a `FormSuccess` object encapsulating the provided data and an optional message.
 *
 * @typeParam TData - The type of the data to be included in the success response.
 * @param data - The data to include in the success object.
 * @param message - An optional success message.
 * @returns A `FormSuccess` object containing the data and message.
 * @example
 * const success = formSuccess({ id: 1 }, "Operation successful");
 */
export const formSuccess = <TData>(
  data: TData,
  message?: string,
): FormSuccess<TData> => ({
  data,
  message,
});
