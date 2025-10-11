import { Err, Ok, type Result } from "@/shared/core/result/result";
import type { DenseFieldErrorMap } from "@/shared/forms/types/dense.types";
import type { SparseFieldValueMap } from "@/shared/forms/types/sparse.types";

// Freeze helper for payloads to preserve immutability guarantees
/* @__PURE__ */
const freeze = <T extends object>(o: T): T => Object.freeze(o);

/**
 * SECTION: Interfaces (object shapes)
 */

/**
 * Success payload shape
 *
 * @typeParam TData - The type of data returned upon form success.
 * @property data - The data resulting from the successful form submission.
 * @property message - A success message.
 */
export interface FormSuccess<TData> {
  readonly data: TData;
  readonly message: string;
}

/**
 * Validation error shape.
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
  TMsg extends string = string,
> {
  readonly kind: "validation";
  // Contract: dense map with readonly string[] (may be empty)
  readonly fieldErrors: DenseFieldErrorMap<TField, TMsg>;
  readonly values?: SparseFieldValueMap<TField, TValue>;
  readonly message: string;
}

/**
 * Future-proofing: broader FormError union (extend in future without breaking validation-only paths).
 */

// biome-ignore lint/suspicious/noEmptyInterface: <for future>
export interface FormSubmissionError {
  // reserved for non-validation submission failures (e.g., network) if ever needed
  // example (future): readonly kind: "submission"; readonly message: string;
}
export type AnyFormError<
  TField extends string,
  TValue = string,
  TMsg extends string = string,
> = FormValidationError<TField, TValue, TMsg> | FormSubmissionError;

/**
 * SECTION: Type aliases (friendly names, unions, reuse)
 */

export type FormOkValue<TData> = FormSuccess<TData>;

export type FormError<
  TField extends string,
  TValue = string,
  TMsg extends string = string,
> = FormValidationError<TField, TValue, TMsg>;

/**
 * Result for forms (unifies success + validation error).
 */
export type FormResult<
  TField extends string,
  TData,
  TValue = string,
  TMsg extends string = string,
> = Result<FormSuccess<TData>, FormValidationError<TField, TValue, TMsg>>;

// Helper type to explicitly restrict the error branch to FormValidationError only (prevents AppError leakage)
export type OnlyFormValidationError<
  TField extends string,
  TValue,
  TMsg extends string,
> = FormValidationError<TField, TValue, TMsg>;

/**
 * Canonical default alias for the most common string case.
 */
export type FormResultStrings<TField extends string, TData> = FormResult<
  TField,
  TData,
  string,
  string
>;

/**
 * SECTION: Constructors and guards
 */

// Create a FormResult success (freezes payload)
export function FormOk<TField extends string, TData>(
  data: TData,
  message: string,
): FormResult<TField, TData> {
  const value = freeze<FormSuccess<TData>>({ data, message });
  // Important: Ok value is FormSuccess<TData>, not TData
  return Ok<FormSuccess<TData>, FormValidationError<TField, string, string>>(
    value,
  );
}

// Create a FormResult validation error (freezes payload)
export function FormErr<
  TField extends string,
  TData,
  TValue = string,
  TMsg extends string = string,
>(params: {
  readonly fieldErrors: DenseFieldErrorMap<TField, TMsg>;
  readonly message: string;
  readonly values?: SparseFieldValueMap<TField, TValue>;
}): FormResult<TField, TData, TValue, TMsg> {
  const error = freeze<FormValidationError<TField, TValue, TMsg>>({
    fieldErrors: params.fieldErrors,
    kind: "validation" as const,
    message: params.message,
    values: params.values,
  });
  return Err<FormSuccess<TData>, FormValidationError<TField, TValue, TMsg>>(
    error,
  );
}

// Narrow to success branch
export function isFormOk<TField extends string, TData>(
  r: FormResult<TField, TData>,
): r is Result<FormSuccess<TData>, never> {
  return r.ok;
}

// Narrow to validation error branch
export function isFormErr<
  TField extends string,
  TData,
  TValue = string,
  TMsg extends string = string,
>(
  r: FormResult<TField, TData, TValue, TMsg>,
): r is Result<never, FormValidationError<TField, TValue, TMsg>> {
  return !r.ok;
}

/**
 * SECTION: Simple maker (payload-only success)
 */

// Build just the success payload (not a Result). Frozen for consistency.
/* @__PURE__ */
export const formSuccess = <TData>(
  data: TData,
  message: string,
): FormSuccess<TData> => freeze({ data, message });

/**
 * SECTION: Convenience constructors
 * Small helpers to reduce generic noise at call sites.
 */

// Field-error-first constructor with defaults for common string cases
export function FormErrStrings<TField extends string, TData>(params: {
  readonly fieldErrors: DenseFieldErrorMap<TField, string>;
  readonly message: string;
  readonly values?: SparseFieldValueMap<TField, string>;
}): FormResult<TField, TData> {
  return FormErr<TField, TData, string, string>(params);
}

/**
 * SECTION: Narrow helpers (value/error extractors)
 * Small, safe helpers to reduce optional chaining in consumers.
 */

/* @__PURE__ */
export function getFormOk<TField extends string, TData>(
  r: FormResult<TField, TData>,
): FormSuccess<TData> | undefined {
  return r.ok ? r.value : undefined;
}

/* @__PURE__ */
export function getFormErr<
  TField extends string,
  TData,
  TValue = string,
  TMsg extends string = string,
>(
  r: FormResult<TField, TData, TValue, TMsg>,
): FormValidationError<TField, TValue, TMsg> | undefined {
  return r.ok ? undefined : r.error;
}

/**
 * SECTION: Normalizers
 * Ensure consumers can rely on defaults without undefined checks.
 */

/* @__PURE__ */
export function withFormMessages<
  TField extends string,
  TData,
  TValue = string,
  TMsg extends string = string,
>(
  r: FormResult<TField, TData, TValue, TMsg>,
  defaults: { readonly success: string; readonly failure: string },
): FormResult<TField, TData, TValue, TMsg> {
  if (r.ok) {
    const next = freeze<FormSuccess<TData>>({
      data: r.value.data,
      message: r.value.message || defaults.success,
    });
    return Ok(next);
  }
  const next = freeze<FormValidationError<TField, TValue, TMsg>>({
    ...r.error,
    message: r.error.message || defaults.failure,
  });
  return Err(next);
}

/**
 * SECTION: Construction guards
 * Compile-time helpers to enforce consistency at call sites.
 */

// Enforce that fieldErrors is dense (all fields present) by accepting a builder function
export function FormErrFromDenseBuilder<
  TField extends string,
  TData,
  TValue = string,
  TMsg extends string = string,
>(params: {
  readonly message: string;
  readonly values?: SparseFieldValueMap<TField, TValue>;
  readonly buildFieldErrors: () => DenseFieldErrorMap<TField, TMsg>;
}): FormResult<TField, TData, TValue, TMsg> {
  const fieldErrors = params.buildFieldErrors();
  return FormErr<TField, TData, TValue, TMsg>({
    fieldErrors,
    message: params.message,
    values: params.values,
  });
}

/**
 * SECTION: Adapters
 * Explicitly convert foreign errors to FormValidationError before producing a Result.
 */

/* @__PURE__ */
export function toFormValidationError<
  TField extends string,
  TValue = string,
  TMsg extends string = string,
>(p: {
  readonly fieldErrors: DenseFieldErrorMap<TField, TMsg>;
  readonly message: string;
  readonly values?: SparseFieldValueMap<TField, TValue>;
}): FormValidationError<TField, TValue, TMsg> {
  return freeze({
    fieldErrors: p.fieldErrors,
    kind: "validation" as const,
    message: p.message,
    values: p.values,
  });
}

/* @__PURE__ */
export function FormErrFromError<
  TField extends string,
  TData,
  TValue = string,
  TMsg extends string = string,
>(
  error: FormValidationError<TField, TValue, TMsg>,
): FormResult<TField, TData, TValue, TMsg> {
  return Err<FormSuccess<TData>, OnlyFormValidationError<TField, TValue, TMsg>>(
    freeze(error),
  );
}

/**
 * SECTION: Value echo utilities
 * Immutable helpers to attach/merge redacted values into error branch.
 */

/* @__PURE__ */
export function withValuesEcho<
  TField extends string,
  TValue = string,
  TMsg extends string = string,
>(
  err: FormValidationError<TField, TValue, TMsg>,
  values: SparseFieldValueMap<TField, TValue> | undefined,
): FormValidationError<TField, TValue, TMsg> {
  if (values === undefined) {
    return err; // preserve reference if no change
  }
  return freeze({
    ...err,
    values,
  });
}

/* @__PURE__ */
export function withValuesEchoResult<
  TField extends string,
  TData,
  TValue = string,
  TMsg extends string = string,
>(
  r: FormResult<TField, TData, TValue, TMsg>,
  values: SparseFieldValueMap<TField, TValue> | undefined,
): FormResult<TField, TData, TValue, TMsg> {
  if (r.ok || values === undefined) {
    return r;
  }
  const nextErr = withValuesEcho<TField, TValue, TMsg>(r.error, values);
  return Err<FormSuccess<TData>, FormValidationError<TField, TValue, TMsg>>(
    nextErr,
  );
}

/**
 * SECTION: Dense builders from sparse (boundary helpers)
 * Convert sparse error/value maps into dense/attached errors immutably.
 */

/* @__PURE__ */
export function fromSparseFieldErrors<
  TField extends string,
  TData,
  TMsg extends string = string,
>(params: {
  readonly fields: readonly TField[];
  readonly sparse: Partial<Record<TField, readonly TMsg[]>>;
  readonly message: string;
}): FormResult<TField, TData, string, TMsg> {
  const dense = toDenseFromSparse<TField, TMsg>(params.sparse, params.fields);
  return FormErr<TField, TData, string, TMsg>({
    fieldErrors: dense,
    message: params.message,
  });
}

/* @__PURE__ */
export function toDenseFromSparse<
  TField extends string,
  TMsg extends string = string,
>(
  sparse: Partial<Record<TField, readonly TMsg[]>>,
  fields: readonly TField[],
): DenseFieldErrorMap<TField, TMsg> {
  const out: Record<TField, readonly TMsg[]> = Object.create(null) as Record<
    TField,
    readonly TMsg[]
  >;
  for (const f of fields) {
    out[f] = (sparse[f] ?? ([] as const)) as readonly TMsg[];
  }
  return freeze(out) as DenseFieldErrorMap<TField, TMsg>;
}

/**
 * SECTION: Flag helpers
 * Tuple flags to simplify branching without re-checking r.ok.
 */

/* @__PURE__ */
export function toFlagsForm<
  TField extends string,
  TData,
  TValue = string,
  TMsg extends string = string,
>(
  r: FormResult<TField, TData, TValue, TMsg>,
): readonly [
  ok: boolean,
  okValue: FormSuccess<TData> | undefined,
  err: FormValidationError<TField, TValue, TMsg> | undefined,
] {
  return r.ok ? [true, r.value, undefined] : [false, undefined, r.error];
}
