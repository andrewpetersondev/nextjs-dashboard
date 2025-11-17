import type {
  DenseFieldErrorMap,
  SparseFieldValueMap,
} from "@/shared/forms/domain/error-maps.types";

/**
 * Represents the state of a successful form submission, with optional message and data.
 *
 * @typeParam TData - The type of the data returned upon a successful submission.
 * @public
 * @readonly
 * @example
 * const successState: SuccessFormState<string> = { data: "Success", success: true };
 */
interface SuccessFormState<Tdata = unknown> {
  readonly data: Tdata;
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
interface FailedFormState<
  Tfield extends string,
  Tvalue = string,
  Tmsg = string,
> {
  readonly errors: DenseFieldErrorMap<Tfield, Tmsg>;
  readonly message: string;
  readonly success: false;
  readonly values?: SparseFieldValueMap<Tfield, Tvalue>;
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
  Tfield extends string,
  Tdata = unknown,
  Tvalue = string,
  Tmsg = string,
> = SuccessFormState<Tdata> | FailedFormState<Tfield, Tvalue, Tmsg>;
