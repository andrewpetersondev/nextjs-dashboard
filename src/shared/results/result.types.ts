import type { AppError } from "@/shared/errors/core/app-error.entity";

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
 * Extracts the error type from a `Result` type.
 *
 * @typeParam TResult - The `Result` type to inspect.
 * @example
 * type MyError = ErrType<Result<number, AppError>>;
 */
export type ErrType<TResult> = TResult extends {
  ok: false;
  error: infer TError;
}
  ? TError
  : never;

/**
 * Represents a successful Result.
 *
 * @typeParam TValue - The success value type.
 * @example
 * const result: OkResult<number> = { ok: true, value: 42 };
 */
export type OkResult<TValue> = { readonly ok: true; readonly value: TValue };

/**
 * Extracts the success type from a `Result` type.
 *
 * @typeParam TResult - The `Result` type to inspect.
 * @example
 * type MyValue = OkType<Result<string, AppError>>;
 */
export type OkType<TResult> = TResult extends { ok: true; value: infer TValue }
  ? TValue
  : never;

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

/**
 * Represents an asynchronous thunk function that returns a promise resolving to a specified value type.
 *
 * This type is independent of the Result pattern and can be used with any async operation.
 *
 * @typeParam TValue - The type of the value the promise resolves to.
 * @example
 * const fetchData: AsyncThunk<string> = async () => "Hello, World!";
 */
export type AsyncThunk<TValue> = () => Promise<TValue>;
