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
 */
export interface FormSuccess<TPayload> {
  readonly data: TPayload;
  readonly message: string;
}

/**
 * Validation error shape.
 */
export interface FormValidationError<
  TFieldName extends string,
  TValueEcho = string,
  TMessage extends string = string,
> {
  readonly kind: "validation";
  // Contract: dense map with readonly string[] (may be empty)
  readonly fieldErrors: DenseFieldErrorMap<TFieldName, TMessage>;
  readonly values?: SparseFieldValueMap<TFieldName, TValueEcho>;
  readonly message: string;
}

/**
 * Future-proofing: broader FormError union (extend in future without breaking validation-only paths).
 */
// biome-ignore lint/suspicious/noEmptyInterface: <for future>
export interface FormSubmissionError {}
export type AnyFormError<
  TFieldName extends string,
  TValueEcho = string,
  TMessage extends string = string,
> = FormValidationError<TFieldName, TValueEcho, TMessage> | FormSubmissionError;

/**
 * SECTION: Type aliases (friendly names, unions, reuse)
 */

export type FormOkValue<TPayload> = FormSuccess<TPayload>;

export type FormError<
  TFieldName extends string,
  TValueEcho = string,
  TMessage extends string = string,
> = FormValidationError<TFieldName, TValueEcho, TMessage>;

/**
 * Result for forms (unifies success + validation error).
 */
export type FormResult<
  TFieldName extends string,
  TPayload,
  TValueEcho = string,
  TMessage extends string = string,
> = Result<
  FormSuccess<TPayload>,
  FormValidationError<TFieldName, TValueEcho, TMessage>
>;

// Helper type to explicitly restrict the error branch to FormValidationError only (prevents AppError leakage)
export type FormValidationErrorOnly<
  TFieldName extends string,
  TValueEcho,
  TMessage extends string,
> = FormValidationError<TFieldName, TValueEcho, TMessage>;

/**
 * Canonical default alias for the most common string case.
 */
export type FormResultStrings<TFieldName extends string, TPayload> = FormResult<
  TFieldName,
  TPayload,
  string,
  string
>;

/**
 * SECTION: Constructors and guards
 */

// Create a FormResult success (freezes payload)
export function FormOk<TFieldName extends string, TPayload>(
  data: TPayload,
  message: string,
): FormResult<TFieldName, TPayload> {
  const value = freeze<FormSuccess<TPayload>>({ data, message });
  return Ok<
    FormSuccess<TPayload>,
    FormValidationError<TFieldName, string, string>
  >(value);
}

// Create a FormResult validation error (freezes payload)
export function FormErr<
  TFieldName extends string,
  TPayload,
  TValueEcho = string,
  TMessage extends string = string,
>(params: {
  readonly fieldErrors: DenseFieldErrorMap<TFieldName, TMessage>;
  readonly message: string;
  readonly values?: SparseFieldValueMap<TFieldName, TValueEcho>;
}): FormResult<TFieldName, TPayload, TValueEcho, TMessage> {
  const error = freeze<FormValidationError<TFieldName, TValueEcho, TMessage>>({
    fieldErrors: params.fieldErrors,
    kind: "validation" as const,
    message: params.message,
    values: params.values,
  });
  return Err<
    FormSuccess<TPayload>,
    FormValidationError<TFieldName, TValueEcho, TMessage>
  >(error);
}

// Narrow to success branch
export function isFormOk<TFieldName extends string, TPayload>(
  r: FormResult<TFieldName, TPayload>,
): r is Result<FormSuccess<TPayload>, never> {
  return r.ok;
}

// Narrow to validation error branch
export function isFormErr<
  TFieldName extends string,
  TPayload,
  TValueEcho = string,
  TMessage extends string = string,
>(
  r: FormResult<TFieldName, TPayload, TValueEcho, TMessage>,
): r is Result<never, FormValidationError<TFieldName, TValueEcho, TMessage>> {
  return !r.ok;
}

/**
 * SECTION: Simple maker (payload-only success)
 */

// Build just the success payload (not a Result). Frozen for consistency.
/* @__PURE__ */
export const formSuccess = <TPayload>(
  data: TPayload,
  message: string,
): FormSuccess<TPayload> => freeze({ data, message });

/**
 * SECTION: Convenience constructors
 * Small helpers to reduce generic noise at call sites.
 */

// Field-error-first constructor with defaults for common string cases
export function formErrStrings<TFieldName extends string, TPayload>(params: {
  readonly fieldErrors: DenseFieldErrorMap<TFieldName, string>;
  readonly message: string;
  readonly values?: SparseFieldValueMap<TFieldName, string>;
}): FormResult<TFieldName, TPayload> {
  return FormErr<TFieldName, TPayload, string, string>(params);
}

/**
 * SECTION: Narrow helpers (value/error extractors)
 * Small, safe helpers to reduce optional chaining in consumers.
 */

/* @__PURE__ */
export function getFormOk<TFieldName extends string, TPayload>(
  r: FormResult<TFieldName, TPayload>,
): FormSuccess<TPayload> | undefined {
  return r.ok ? r.value : undefined;
}

/* @__PURE__ */
export function getFormErr<
  TFieldName extends string,
  TPayload,
  TValueEcho = string,
  TMessage extends string = string,
>(
  r: FormResult<TFieldName, TPayload, TValueEcho, TMessage>,
): FormValidationError<TFieldName, TValueEcho, TMessage> | undefined {
  return r.ok ? undefined : r.error;
}

/**
 * SECTION: Normalizers
 * Ensure consumers can rely on defaults without undefined checks.
 */

/* @__PURE__ */
export function withFormResultMessages<
  TFieldName extends string,
  TPayload,
  TValueEcho = string,
  TMessage extends string = string,
>(
  r: FormResult<TFieldName, TPayload, TValueEcho, TMessage>,
  defaults: { readonly success: string; readonly failure: string },
): FormResult<TFieldName, TPayload, TValueEcho, TMessage> {
  if (r.ok) {
    const next = freeze<FormSuccess<TPayload>>({
      data: r.value.data,
      message: r.value.message || defaults.success,
    });
    return Ok(next);
  }
  const next = freeze<FormValidationError<TFieldName, TValueEcho, TMessage>>({
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
  TFieldName extends string,
  TPayload,
  TValueEcho = string,
  TMessage extends string = string,
>(params: {
  readonly message: string;
  readonly values?: SparseFieldValueMap<TFieldName, TValueEcho>;
  readonly buildFieldErrors: () => DenseFieldErrorMap<TFieldName, TMessage>;
}): FormResult<TFieldName, TPayload, TValueEcho, TMessage> {
  const fieldErrors = params.buildFieldErrors();
  return FormErr<TFieldName, TPayload, TValueEcho, TMessage>({
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
  TFieldName extends string,
  TValueEcho = string,
  TMessage extends string = string,
>(p: {
  readonly fieldErrors: DenseFieldErrorMap<TFieldName, TMessage>;
  readonly message: string;
  readonly values?: SparseFieldValueMap<TFieldName, TValueEcho>;
}): FormValidationError<TFieldName, TValueEcho, TMessage> {
  return freeze({
    fieldErrors: p.fieldErrors,
    kind: "validation" as const,
    message: p.message,
    values: p.values,
  });
}

/* @__PURE__ */
export function FormErrFromError<
  TFieldName extends string,
  TPayload,
  TValueEcho = string,
  TMessage extends string = string,
>(
  error: FormValidationError<TFieldName, TValueEcho, TMessage>,
): FormResult<TFieldName, TPayload, TValueEcho, TMessage> {
  return Err<
    FormSuccess<TPayload>,
    FormValidationError<TFieldName, TValueEcho, TMessage>
  >(freeze(error));
}

/**
 * SECTION: Value echo utilities
 * Immutable helpers to attach/merge redacted values into error branch.
 */

/* @__PURE__ */
export function withValuesEcho<
  TFieldName extends string,
  TValueEcho = string,
  TMessage extends string = string,
>(
  err: FormValidationError<TFieldName, TValueEcho, TMessage>,
  values: SparseFieldValueMap<TFieldName, TValueEcho> | undefined,
): FormValidationError<TFieldName, TValueEcho, TMessage> {
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
  TFieldName extends string,
  TPayload,
  TValueEcho = string,
  TMessage extends string = string,
>(
  r: FormResult<TFieldName, TPayload, TValueEcho, TMessage>,
  values: SparseFieldValueMap<TFieldName, TValueEcho> | undefined,
): FormResult<TFieldName, TPayload, TValueEcho, TMessage> {
  if (r.ok || values === undefined) {
    return r;
  }
  const nextErr = withValuesEcho<TFieldName, TValueEcho, TMessage>(
    r.error,
    values,
  );
  return Err<
    FormSuccess<TPayload>,
    FormValidationError<TFieldName, TValueEcho, TMessage>
  >(nextErr);
}

/**
 * SECTION: Dense builders from sparse (boundary helpers)
 * Convert sparse error/value maps into dense/attached errors immutably.
 */

/* @__PURE__ */
export function fromSparseFieldErrors<
  TFieldName extends string,
  TPayload,
  TMessage extends string = string,
>(params: {
  readonly fields: readonly TFieldName[];
  readonly sparse: Partial<Record<TFieldName, readonly TMessage[]>>;
  readonly message: string;
}): FormResult<TFieldName, TPayload, string, TMessage> {
  const dense = toDenseFromSparse<TFieldName, TMessage>(
    params.sparse,
    params.fields,
  );
  return FormErr<TFieldName, TPayload, string, TMessage>({
    fieldErrors: dense,
    message: params.message,
  });
}

/* @__PURE__ */
export function toDenseFromSparse<
  TFieldName extends string,
  TMessage extends string = string,
>(
  sparse: Partial<Record<TFieldName, readonly TMessage[]>>,
  fields: readonly TFieldName[],
): DenseFieldErrorMap<TFieldName, TMessage> {
  const out: Record<TFieldName, readonly TMessage[]> = Object.create(
    null,
  ) as Record<TFieldName, readonly TMessage[]>;
  for (const f of fields) {
    out[f] = (sparse[f] ?? ([] as const)) as readonly TMessage[];
  }
  return freeze(out) as DenseFieldErrorMap<TFieldName, TMessage>;
}

/**
 * SECTION: Flag helpers
 * Tuple flags to simplify branching without re-checking r.ok.
 */

/* @__PURE__ */
export function formResultFlags<
  TFieldName extends string,
  TPayload,
  TValueEcho = string,
  TMessage extends string = string,
>(
  r: FormResult<TFieldName, TPayload, TValueEcho, TMessage>,
): readonly [
  ok: boolean,
  okValue: FormSuccess<TPayload> | undefined,
  err: FormValidationError<TFieldName, TValueEcho, TMessage> | undefined,
] {
  return r.ok ? [true, r.value, undefined] : [false, undefined, r.error];
}
