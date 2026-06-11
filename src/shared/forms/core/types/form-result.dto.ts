import type { AppErrorJsonDto } from "@/shared/core/errors/core/app-error.dto";
import type { OkResult } from "@/shared/core/result/result.dto";
import type {
	DenseFieldErrorMap,
	FormErrors,
} from "@/shared/forms/core/types/field-error.types";
import type { SparseFieldValueMap } from "@/shared/forms/core/types/field-value.types";

/**
 * Failed form submission carrying a serialized error.
 *
 * The error side holds an {@link AppErrorJsonDto} (plain object), not an
 * `AppError` instance: form results cross the Server Action boundary via
 * `useActionState`, and Next.js must be able to serialize them (e.g. for
 * progressive enhancement of no-JS form posts). Class instances break that.
 */
type FormErrResult = {
	readonly error: AppErrorJsonDto;
	readonly ok: false;
};

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
 * Boundary DTO union for form submissions (ADR 001).
 *
 * Not a variant of core `Result`: it deliberately shares `OkResult` and the
 * `ok` discriminant so narrowing reads identically everywhere, but its error
 * side is a plain {@link AppErrorJsonDto} — entities in-process, DTOs at the
 * `useActionState` edge.
 *
 * @typeParam T - The type of the data returned on success.
 *
 * @example
 * const result: FormResult<User> = ok({
 *   data: { id: "1", name: "Alice" },
 *   message: "User created successfully."
 * });
 */
export type FormResult<T> = OkResult<FormSuccessPayload<T>> | FormErrResult;

/**
 * State crossing the `useActionState` boundary: `null` until the first
 * submission, then a {@link FormResult}.
 *
 * `null` is the idle state (ADR 001) — forms pass it as the initial value,
 * and actions can never produce it: `FormAction` returns `FormResult`, so the
 * type system guarantees idle only ever comes from the initial render.
 */
export type FormState<T> = FormResult<T> | null;
