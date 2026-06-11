import type { AppError } from "@/shared/core/errors/core/app-error.entity";

/**
 * Represents a failed Result.
 *
 * @typeParam TError - The error type, must extend `AppError`.
 * @example
 * const error: AppError = { code: "ERR", message: "Something went wrong" };
 * const result: ErrResult<typeof error> = { error, ok: false };
 */
export type ErrResult<TError extends AppError> = {
	readonly error: TError;
	readonly ok: false;
};

/**
 * Represents a successful Result.
 *
 * @typeParam TValue - The success value type.
 * @example
 * const result: OkResult<number> = { ok: true, value: 42 };
 */
export type OkResult<TValue> = { readonly ok: true; readonly value: TValue };

/**
 * Discriminated union for operation results.
 *
 * @typeParam TValue - The success value type.
 * @typeParam TError - The error type, must extend `AppError`.
 * @example
 * const ok: Result<number, AppError> = { ok: true, value: 1 };
 * const err: Result<number, AppError> = { ok: false, error: { code: "ERR", message: "fail" } };
 */
export type Result<TValue, TError extends AppError> =
	| OkResult<TValue>
	| ErrResult<TError>;
