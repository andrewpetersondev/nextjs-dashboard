import type { Result } from "@/shared/core/result/result";
import type {
  DenseFieldErrorMap,
  SparseFieldValueMap,
} from "@/shared/forms/types/field-errors.type";

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
  readonly fieldErrors: DenseFieldErrorMap<TField, TMsg>;
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

/* -------------------------------------------------------------------------- */
/* Constructors / Type Guards                                                 */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Accurate Legacy Types (Deprecated)                                         */
/* -------------------------------------------------------------------------- */

/**
 * Represents the state of a successful form submission, with optional message and data.
 *
 * @typeParam TData - The type of the data returned upon a successful submission.
 * @public
 * @readonly
 * @example
 * const successState: SuccessFormState<string> = { data: "Success", success: true };
 */
export interface SuccessFormState<TData = unknown> {
  readonly data: TData;
  readonly errors?: never;
  readonly message?: string;
  readonly success: true;
  readonly values?: never;
}

/**
 * Represents the state of a form submission that has failed.
 *
 * @typeParam TField - The type of the field keys.
 * @typeParam TValue - The type of the optional field values. Defaults to `string`.
 * @typeParam TMsg - The type of the error messages. Defaults to `string`.
 * @public
 */
export interface FailedFormState<
  TField extends string,
  TValue = string,
  TMsg = string,
> {
  readonly errors: DenseFieldErrorMap<TField, TMsg>;
  readonly message: string;
  readonly success: false;
  readonly values?: SparseFieldValueMap<TField, TValue>;
}

/**
 * @alpha
 * Represents the state of a legacy form, which can either be a success or failure state.
 *
 * @typeParam TField - The type representing field names.
 * @typeParam TData - The type of data in the success state. Defaults to `unknown`.
 * @typeParam TValue - The type of field values in the failure state. Defaults to `string`.
 * @typeParam TMsg - The type of error messages in the failure state. Defaults to `string`.
 */
export type LegacyFormState<
  TField extends string,
  TData = unknown,
  TValue = string,
  TMsg = string,
> = SuccessFormState<TData> | FailedFormState<TField, TValue, TMsg>;
