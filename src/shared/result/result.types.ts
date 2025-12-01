import type { AppError } from "@/shared/errors/core/app-error.class";

/**
 * Represents a successful Result.
 */
export type OkResult<T> = { readonly ok: true; readonly value: T };

/**
 * Represents a failed Result.
 */
export type ErrResult<E extends AppError> = {
  readonly error: E;
  readonly ok: false;
};

/**
 * Discriminated union for operation results.
 *
 * @typeParam T - The value type.
 * @typeParam E - The error type, must extend AppError.
 */
export type Result<T, E extends AppError> = OkResult<T> | ErrResult<E>;

/**
 * Extracts the success type from a `Result` type.
 */
export type OkType<R> = R extends { ok: true; value: infer U } ? U : never;

/**
 * Extracts the error type from a `Result` type.
 */
export type ErrType<R> = R extends { ok: false; error: infer F } ? F : never;

/**
 * Represents an asynchronous thunk function that returns a promise resolving to a specified value type.
 *
 * @typeParam T - The type of the value the promise resolves to.
 * @example
 * const fetchData: AsyncThunk<string> = async () => "Hello, World!";
 */
export type AsyncThunk<T> = () => Promise<T>;
