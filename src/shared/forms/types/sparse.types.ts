/**
 * src/shared/forms/types/sparse.types.ts
 *
 * 1) Maps
 * 2) Field Errors
 * 3) Form Errors
 *
 */

import type { FieldError } from "@/shared/forms/types/core.types";

/**
 * Represents a sparse map where keys are strings and values are of a specified type.
 *
 * @typeParam TKey - Union of string keys.
 * @typeParam TValue - Type of the values associated with each key.
 * @example
 * const sparse: SparseMap<'email' | 'password', readonly string[]> = {
 *   password: ['Too short'], // 'email' key is omitted
 * };
 */
export type SparseMap<TKey extends string, TValue> = Readonly<
  Partial<Record<TKey, Readonly<TValue>>>
>;

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
