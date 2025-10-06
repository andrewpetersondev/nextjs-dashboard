import type {
  DenseReadonlyRecord,
  NonEmptyReadonlyArray,
} from "@/shared/forms/types/core-types.util";

/**
 * Represents an error associated with a field, containing a non-empty, readonly array of messages.
 *
 * @typeParam TMsg - The type of the error message, defaulting to `string`.
 * @public
 * @example
 * const error: FieldError = ["Required field", "Invalid format"];
 */
export type FieldError<TMsg = string> = NonEmptyReadonlyArray<TMsg>;

/**
 * @public
 * Represents a sparse map of field errors, useful for form validation.
 *
 * @typeParam TField - The union of valid field names.
 * @typeParam TMsg - The type of error message, defaults to `string`.
 * @example
 * ```ts
 * type FormErrors = SparseFieldErrorMap<'email' | 'password'>;
 * ```
 */
export type SparseFieldErrorMap<TField extends string, TMsg = string> = Partial<
  Readonly<Record<TField, FieldError<TMsg>>>
>;

/**
 * Represents a dense mapping of field names to an array of error messages.
 *
 * @typeParam TField - The type representing the fields, typically a string literal union.
 * @typeParam TMsg - The type of the error message, defaults to `string`.
 * @see DenseReadonlyRecord
 * @public
 */
export type DenseFieldErrorMap<
  TField extends string,
  TMsg = string,
> = DenseReadonlyRecord<TField, readonly TMsg[]>;

/**
 * Represents a map where specified fields may have associated values, or be undefined.
 *
 * @typeParam TField - The set of keys (fields) that can exist in the map.
 * @typeParam TValue - The type of values associated with the keys. Defaults to `string`.
 * @example
 * ```
 * type UserFields = SparseFieldValueMap<'name' | 'email', string>;
 * const example: UserFields = { name: 'John Doe' };
 * ```
 */
export type SparseFieldValueMap<
  TField extends string,
  TValue = string,
> = Partial<Record<TField, TValue>>;

// Enriched error messages with codes for i18n/UX consistency.
/**
 * Represents an error message with a code and descriptive text.
 *
 * @public
 * @readonly
 * @example
 * ```
 * const error: ErrorMessage = { code: '404', message: 'Not Found' };
 * ```
 */
export interface ErrorMessage {
  readonly code: string;
  readonly message: string;
}

/**
 * Represents a dense error mapping for fields with associated error messages.
 *
 * @typeParam TField - The type of field keys used in the error mapping.
 * @remarks This type associates each field with a specific error message.
 * @see {DenseFieldErrorMap}, {ErrorMessage}
 * @beta
 */
export type DenseFieldErrorMapCoded<TField extends string> = DenseFieldErrorMap<
  TField,
  ErrorMessage
>;

/**
 * @alpha
 * Represents a form error with a specific code and message.
 *
 * @property code - A unique identifier for the error.
 * @property message - A descriptive message about the error.
 */
export interface FormErrorCoded {
  readonly code: string;
  readonly message: string;
}

/**
 * @public
 * Represents a mapping of errors in a dense format, associating fields and messages with codes.
 *
 * @typeParam TField - The string type representing specific form fields.
 * @property form - An optional error code for the entire form.
 * @property fields - An optional mapping of specific field names to error messages.
 */
export interface DenseErrorMapCoded<TField extends string> {
  readonly form?: FormErrorCoded;
  readonly fields?: Partial<Record<TField, ErrorMessage>>;
}
