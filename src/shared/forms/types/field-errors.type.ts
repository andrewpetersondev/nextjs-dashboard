import type {
  DenseMap,
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
 * @see DenseMap
 * @public
 */
export type DenseFieldErrorMap<TField extends string, TMsg = string> = DenseMap<
  TField,
  readonly TMsg[]
>;

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
