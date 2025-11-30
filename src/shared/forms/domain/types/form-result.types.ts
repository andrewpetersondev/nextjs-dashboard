import type { AppError } from "@/shared/errors/core/app-error.class";
import type { Result } from "@/shared/result/result";

/**
 * Represents a successful form submission payload.
 *
 * @typeParam T - The type of the data returned on success.
 *
 * @example
 * const success: FormSuccess<User> = {
 *   data: { id: "1", name: "Alice" },
 *   message: "User created successfully."
 * };
 */
export interface FormSuccess<T> {
  readonly data: T;
  readonly message: string;
}

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
export type FormResult<T> = Result<FormSuccess<T>, AppError>;
