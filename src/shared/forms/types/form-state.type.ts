import type { Result } from "@/shared/core/result/result";
import type {
  DenseFieldErrorMap,
  SparseFieldValueMap,
} from "@/shared/forms/types/field-errors.type";

/**
 * Pure success payload (no discriminant flags; those live on Result).
 * @template TData Parsed & validated domain data.
 */
export interface FormSuccess<TData> {
  readonly data: TData;
  readonly message?: string;
}

/**
 * Validation error payload (first and most common error kind).
 * @template TField Field name union.
 * @template TValue Raw value type (usually string).
 * @template TMsg Error message type.
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
 * Union of all form errors (extend with more kinds later).
 */
export type FormError<
  TField extends string,
  TValue = string,
  TMsg = string,
> = FormValidationError<TField, TValue, TMsg>;

/**
 * Canonical form result.
 */
export type FormResult<
  TField extends string,
  TData,
  TValue = string,
  TMsg = string,
> = Result<FormSuccess<TData>, FormError<TField, TValue, TMsg>>;

/* -------------------------------------------------------------------------- */
/* Constructors / Type Guards                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Build a FormSuccess payload.
 */
export const formSuccess = <TData>(
  data: TData,
  message?: string,
): FormSuccess<TData> => ({
  data,
  message,
});

/**
 * Build a validation error payload.
 */
export const validationError = <TField extends string, TValue, TMsg>(
  input: Omit<FormValidationError<TField, TValue, TMsg>, "kind">,
): FormValidationError<TField, TValue, TMsg> => ({
  kind: "validation",
  ...input,
});

/**
 * Narrow a FormError to validation error.
 */
export const isValidationError = <TField extends string, TValue, TMsg>(
  err: FormError<TField, TValue, TMsg>,
): err is FormValidationError<TField, TValue, TMsg> =>
  err.kind === "validation";

/* -------------------------------------------------------------------------- */
/* Accurate Legacy Types (Deprecated)                                         */
/* -------------------------------------------------------------------------- */

/**
 * @deprecated Use FormResult instead.
 */
export interface SuccessFormState<TData = unknown> {
  readonly data: TData;
  readonly errors?: never;
  readonly message?: string;
  readonly success: true;
  readonly values?: never;
}

/**
 * @deprecated Use FormResult instead.
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
 * @deprecated Union of legacy success/failure form state.
 */
export type LegacyFormState<
  TField extends string,
  TData = unknown,
  TValue = string,
  TMsg = string,
> = SuccessFormState<TData> | FailedFormState<TField, TValue, TMsg>;

/* -------------------------------------------------------------------------- */
/* Convenience Narrowing Helpers                                              */
/* -------------------------------------------------------------------------- */

/**
 * Extract validation error or undefined for ergonomic optional chaining.
 */
export const getValidationError = <
  TField extends string,
  TData,
  TValue = string,
  TMsg = string,
>(
  res: FormResult<TField, TData, TValue, TMsg>,
): FormValidationError<TField, TValue, TMsg> | undefined =>
  // biome-ignore lint/style/noNestedTernary: <fix when implementing>
  res.ok ? undefined : isValidationError(res.error) ? res.error : undefined;
