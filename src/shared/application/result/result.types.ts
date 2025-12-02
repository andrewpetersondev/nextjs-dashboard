import type { AppError } from "@/shared/infrastructure/errors/core/app-error.class";

/**
 * Represents a failed Result.
 *
 * @typeParam E - The error type, must extend AppError.
 * @example
 * const error: AppError = { code: "ERR", message: "Something went wrong" };
 * const result: ErrResult<typeof error> = { error, ok: false };
 */
export type ErrResult<E extends AppError> = {
  readonly error: E;
  readonly ok: false;
};

/**
 * Extracts the error type from a `Result` type.
 *
 * @typeParam R - The Result type.
 * @example
 * type MyError = ErrType<Result<number, AppError>>;
 */
export type ErrType<R> = R extends { ok: false; error: infer F } ? F : never;

/**
 * Represents a successful Result.
 *
 * @typeParam T - The value type.
 * @example
 * const result: OkResult<number> = { ok: true, value: 42 };
 */
export type OkResult<T> = { readonly ok: true; readonly value: T };

/**
 * Extracts the success type from a `Result` type.
 *
 * @typeParam R - The Result type.
 * @example
 * type MyValue = OkType<Result<string, AppError>>;
 */
export type OkType<R> = R extends { ok: true; value: infer U } ? U : never;

/**
 * Discriminated union for operation results.
 *
 * @typeParam T - The value type.
 * @typeParam E - The error type, must extend AppError.
 * @example
 * const ok: Result<number, AppError> = { ok: true, value: 1 };
 * const err: Result<number, AppError> = { ok: false, error: { code: "ERR", message: "fail" } };
 */
export type Result<T, E extends AppError> = OkResult<T> | ErrResult<E>;

/**
 * Represents an asynchronous thunk function that returns a promise resolving to a specified value type.
 *
 * @typeParam T - The type of the value the promise resolves to.
 * @example
 * const fetchData: AsyncThunk<string> = async () => "Hello, World!";
 */
export type AsyncThunk<T> = () => Promise<T>;
