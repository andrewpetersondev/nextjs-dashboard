import type { NonEmptyArray } from "@/shared/forms/core/types/array.types";

/**
 * Represents an error associated with a field as a non-empty array of messages.
 *
 * @typeParam T - The type of error message, defaults to string.
 */
export type FieldError<T = string> = NonEmptyArray<T>;

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

/**
 * Represents general form-level errors as an array of strings.
 */
export type FormErrors = readonly string[];
