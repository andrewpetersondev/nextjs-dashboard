import type { NonEmptyArray } from "@/shared/forms/types/form-utils.types";

/**
 * Represents an error associated with a field as a non-empty array of messages.
 *
 * @typeParam T - The type of error message, defaults to string.
 */
export type FieldError<T = string> = NonEmptyArray<T>;

/**
 * Represents all field errors in a form, mapping field names to arrays of error messages.
 */
export type FieldErrors = Readonly<Record<string, readonly string[]>>;

/**
 * Represents general form-level errors as an array of strings.
 */
export type FormErrors = readonly string[];

/**
 * A sparse map of field errors, where only fields with errors are present.
 *
 * @typeParam T - Field name keys.
 * @typeParam M - Error message type.
 *
 * @example
 * const errors: SparseFieldErrorMap<"email" | "password", string> = {
 *   email: ["Email is required."]
 * };
 */
export type SparseFieldErrorMap<T extends string, M> = Partial<
  Readonly<Record<T, FieldError<M>>>
>;

/**
 * A sparse map of field values, where only fields with values are present.
 *
 * @typeParam T - Field name keys.
 * @typeParam V - Value type.
 *
 * @example
 * const values: SparseFieldValueMap<"email" | "password", string> = {
 *   email: "alice@example.com"
 * };
 */
export type SparseFieldValueMap<T extends string, V> = Partial<Record<T, V>>;

/**
 * A dense map of field errors, where all fields are present.
 *
 * @typeParam T - Field name keys.
 * @typeParam M - Error message type.
 *
 * @example
 * const errors: DenseFieldErrorMap<"email" | "password", string> = {
 *   email: [],
 *   password: ["Password is too short."]
 * };
 */
export type DenseFieldErrorMap<T extends string, M> = Readonly<
  Record<T, readonly M[]>
>;
