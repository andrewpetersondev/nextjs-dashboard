import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { DenseFieldErrorMap } from "@/shared/forms/types/field-error.value";
import type { Result } from "@/shared/result/result.types";

/**
 * Represents a successful form submission payload.
 *
 * @typeParam T - The type of the data returned on success.
 *
 * @example
 * const success: FormSuccessPayload<User> = {
 *   data: { id: "1", name: "Alice" },
 *   message: "User created successfully."
 * };
 */
export interface FormSuccessPayload<T> {
  readonly data: T;
  readonly message: string;
}

/**
 * Payload for form errors, including field-specific errors and a general message.
 *
 * @typeParam T - The type of the field names.
 *
 * @example
 * const errorPayload: FormErrorPayload<"email" | "password"> = {
 *   fieldErrors: {
 *     email: ["Email is required."],
 *     password: []
 *   },
 *   message: "There were errors with your submission."
 * };
 */
export type FormErrorPayload<T extends string> = {
  fieldErrors: DenseFieldErrorMap<T, string>;
  message: string;
};

/**
 * Result type for form submissions, using standard Result.
 *
 * @typeParam T - The type of the data returned on success.
 *
 * @example
 * const result: FormResult<User> = ok({
 *   data: { id: "1", name: "Alice" },
 *   message: "User created successfully."
 * });
 */
export type FormResult<T> = Result<FormSuccessPayload<T>, AppError>;
