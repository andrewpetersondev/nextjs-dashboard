import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import type { Result } from "@/shared/core/results/result.types";
import type {
  DenseFieldErrorMap,
  FormErrors,
} from "@/shared/forms/core/types/field-error.types";
import type { SparseFieldValueMap } from "@/shared/forms/core/types/field-value.types";

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
 * Payload for form errors, including field-specific errors, form-level errors, and a general message.
 *
 * @typeParam T - The type of the field names.
 *
 * @example
 * const errorPayload: FormErrorPayload<"email" | "password"> = {
 *   fieldErrors: {
 *     email: ["Email is required."],
 *     password: []
 *   },
 *   formErrors: ["Generic error."],
 *   message: "There were errors with your submission."
 * };
 */
export type FormErrorPayload<T extends string> = {
  readonly fieldErrors: DenseFieldErrorMap<T, string>;
  readonly formErrors: FormErrors;
  readonly message: string;
  readonly formData: SparseFieldValueMap<T, string>;
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
