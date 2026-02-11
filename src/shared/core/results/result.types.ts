import type { AppError } from "@/shared/core/errors/core/app-error.entity";

// TODO: Helper robustness: the simplest and most resilient way to extract the union’s types is to tie helpers
//  directly to the tagged members, not to loose object shapes.

/**
 * Extracts the error type from a `Result` type.
 *
 * @typeParam TResult - The `Result` type to inspect.
 * @example
 * type MyError = ErrType<Result<number, AppError>>;
 */
export type ErrType<TResult> =
  TResult extends ErrResult<infer TError> ? TError : never;

/**
 * Extracts the success type from a `Result` type.
 *
 * @typeParam TResult - The `Result` type to inspect.
 * @example
 * type MyValue = OkType<Result<string, AppError>>;
 */
export type OkType<TResult> =
  TResult extends OkResult<infer TValue> ? TValue : never;

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

/**
 * A utility type for applying a transformation function to a successful `Result` value.
 *
 * @typeParam T - The type of the input value in the `Result`.
 * @typeParam U - The type of the transformed value.
 * @typeParam E - The type of the error, defaults to `AppError`.
 *
 * @param fn - A transformation function to apply to the `T` value.
 * @returns A function that accepts a `Result<T, E>` and returns a `Result<U, E>`.
 */
export type MapOk = <T, U, E extends AppError>(
  fn: (v: T) => U,
) => (r: Result<T, E>) => Result<U, E>;

/**
 * Transforms the error type of a `Result` using a mapping function.
 *
 * @typeParam T - The success value type.
 * @typeParam E1 - The original error type, constrained to `AppError`.
 * @typeParam E2 - The mapped error type, constrained to `AppError`.
 * @param fn - A function that maps from `E1` to `E2`.
 * @returns A function that maps a `Result<T, E1>` to `Result<T, E2>`.
 */
export type MapErr = <T, E1 extends AppError, E2 extends AppError>(
  fn: (e: E1) => E2,
) => (r: Result<T, E1>) => Result<T, E2>;

/**
 * Transforms both success and error states of a `Result` type using the provided functions.
 *
 * @typeParam T - The input success value type.
 * @typeParam U - The output success value type.
 * @typeParam E1 - The input error type, extending `AppError`.
 * @typeParam E2 - The output error type, extending `AppError`.
 * @param onOk - A function to transform the success value.
 * @param onErr - A function to transform the error value.
 * @returns A function that maps a `Result<T, E1>` to `Result<U, E2>`.
 */
export type MapBoth = <T, U, E1 extends AppError, E2 extends AppError>(
  onOk: (v: T) => U,
  onErr: (e: E1) => E2,
) => (r: Result<T, E1>) => Result<U, E2>;
