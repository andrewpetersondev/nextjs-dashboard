import type {
  DenseFieldErrorMap,
  SparseFieldValueMap,
} from "@/shared/forms/types/field-errors.type";

/**
 * Successful form state.
 *
 * - `errors` and `values` are omitted (set to `never` to aid IDE autocomplete and safety).
 * - `message` is optional (success may not always carry a friendly message).
 *
 * @typeParam TData - validated form data shape (required).
 */
export interface SuccessFormState<TData = unknown> {
  readonly data: TData;
  readonly errors?: never;
  readonly message?: string;
  readonly success: true;
  readonly values?: never;
}

/**
 * Failed form state.
 *
 * - `errors` here is the **dense** error map (every field present).
 * - `values` is sparse: present only for fields the caller wants to echo back (avoid sensitive fields).
 *
 * @typeParam TField - string-literal union of field names (required).
 * @typeParam TValue - raw form value type (default: string).
 * @typeParam TMsg - message type (default: string).
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
 * Canonical FormState discriminated union for UI consumption.
 * @template TFieldNames Field name union.
 * @template TData Successful parsed payload.
 */
export type FormState<TFieldNames extends string, TData> =
  | {
      readonly ok: true;
      readonly data: TData;
      readonly message: string;
    }
  | {
      readonly ok: false;
      readonly errors: DenseFieldErrorMap<TFieldNames>;
      readonly values: Record<TFieldNames, string | undefined>;
      readonly message: string;
    };
