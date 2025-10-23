/**
 * src/shared/forms/types/dense.types.ts
 *
 * 1) Maps
 * 2) Field Errors
 * 3) Form Errors
 *
 */

/**
 * Represents a dense map where keys are strings and values are of a specified type.
 *
 * All keys are present; values are readonly.
 */
export type DenseMap<TKey extends string, TValue> = Readonly<
  Record<TKey, Readonly<TValue>>
>;

/**
 * Represents a dense mappers of field names to an array of error messages.
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
