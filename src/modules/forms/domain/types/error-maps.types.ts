import type { FieldError } from "@/modules/forms/domain/types/field-error.types";

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
