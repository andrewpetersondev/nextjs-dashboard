/** biome-ignore-all lint/nursery/noExcessiveLinesPerFile: <getting close> */
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Converts Result to Promise. Resolves with value if ok, rejects with error otherwise.
 *
 * @typeParam TValue - Success value type.
 * @typeParam TError - Error type extending AppError.
 * @param r - Result to transform.
 * @returns Promise resolving to value or rejecting with error.
 * @throws Throws error if result is not ok.
 */
export function toPromiseOrThrow<TValue, TError extends AppError>(
  r: Result<TValue, TError>,
): Promise<TValue> {
  if (r.ok) {
    return Promise.resolve(r.value);
  }

  // Ensure rejection with an Error instance (AppError extends Error)
  return Promise.reject(
    r.error instanceof Error ? r.error : new Error(String(r.error)),
  );
}

/**
 * Async maps successful Result to new value.
 *
 * @typeParam TValue - Original value type.
 * @typeParam TNextValue - Transformed value type.
 * @typeParam TError - Error type extending AppError.
 * @param fn - Async function to transform value.
 * @returns A function that accepts a Result and returns a Promise resolving to transformed Result or original error.
 */
export function mapAsync<TValue, TNextValue, TError extends AppError>(
  fn: (v: TValue) => Promise<TNextValue>,
): (r: Result<TValue, TError>) => Promise<Result<TNextValue, TError>> {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Promise<Result<TNextValue, TError>> =>
    r.ok ? fn(r.value).then(Ok) : Promise.resolve(r);
}

/**
 * Safely transforms Result value asynchronously, mapping thrown errors.
 *
 * @typeParam TValue - Input value type.
 * @typeParam TNextValue - Output value type.
 * @typeParam TError - Original error type.
 * @typeParam TSideError - Side error type from transformation.
 * @param fn - Async function to transform value.
 * @param mapError - Maps exceptions during execution.
 * @returns A function that accepts a Result and returns a Promise resolving to new Result with transformed value or error.
 */
export function mapSafeAsync<
  TValue,
  TNextValue,
  TError extends AppError,
  TSideError extends AppError,
>(
  fn: (v: TValue) => Promise<TNextValue>,
  mapError: (e: unknown) => TSideError,
): (
  r: Result<TValue, TError>,
) => Promise<Result<TNextValue, TError | TSideError>> {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TNextValue, TError | TSideError>> => {
    if (!r.ok) {
      return r;
    }
    try {
      return Ok(await fn(r.value));
    } catch (e) {
      return Err(mapError(e));
    }
  };
}

/**
 * Maps error in async Result with transformation function.
 *
 * @typeParam TValue - Success value type.
 * @typeParam TError - Original error type.
 * @typeParam TNextError - Transformed error type.
 * @param fn - Transforms original error to new error asynchronously.
 * @returns A function that accepts a Result and returns a Promise resolving to transformed error or original value.
 */
export function mapErrAsync<
  TValue,
  TError extends AppError,
  TNextError extends AppError,
>(
  fn: (e: TError) => Promise<TNextError>,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TNextError>> {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TNextError>> =>
    r.ok ? Promise.resolve(r) : fn(r.error).then(Err);
}

/**
 * Safely transforms errors asynchronously, handling unexpected errors.
 *
 * @typeParam TValue - Successful result value type.
 * @typeParam TError - Initial error type extending AppError.
 * @typeParam TNextError - Transformed error type extending AppError.
 * @typeParam TSideError - Side-error type from mapError function.
 * @param fn - Async function mapping TError to TNextError.
 * @param mapError - Handles unexpected errors.
 * @returns A function that accepts a Result and returns a Promise resolving to Result with transformed error or value.
 */
export function mapErrSafeAsync<
  TValue,
  TError extends AppError,
  TNextError extends AppError,
  TSideError extends AppError,
>(
  fn: (e: TError) => Promise<TNextError>,
  mapError: (e: unknown) => TSideError,
): (
  r: Result<TValue, TError>,
) => Promise<Result<TValue, TNextError | TSideError>> {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TNextError | TSideError>> => {
    if (r.ok) {
      return r;
    }
    try {
      const next = await fn(r.error);
      return Err(next);
    } catch (e) {
      return Err(mapError(e));
    }
  };
}

/**
 * Executes async function if Result is successful.
 *
 * @typeParam TValue - Successful result value type.
 * @typeParam TError - Error type extending AppError.
 * @param fn - Async function to execute with value.
 * @returns A function that accepts a Result and returns a Promise resolving to same Result.
 */
export function tapAsync<TValue, TError extends AppError>(
  fn: (v: TValue) => Promise<void>,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError>> {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TError>> => {
    if (r.ok) {
      return fn(r.value).then(() => r);
    }
    return Promise.resolve(r);
  };
}

/**
 * Safely executes async operation on Result, mapping thrown errors.
 *
 * @typeParam TValue - Successful value type.
 * @typeParam TError - Original error type.
 * @typeParam TSideError - Mapped side error type.
 * @param fn - Async function to execute if successful.
 * @param mapError - Maps thrown errors to TSideError.
 * @returns A function that accepts a Result and returns a Promise resolving to same Result or wrapping error.
 */
export function tapSafeAsync<
  TValue,
  TError extends AppError,
  TSideError extends AppError,
>(
  fn: (v: TValue) => Promise<void>,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | TSideError>> {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TError | TSideError>> => {
    if (!r.ok) {
      return r;
    }
    try {
      await fn(r.value);
      return r;
    } catch (e) {
      return Err(mapError(e));
    }
  };
}

/**
 * Handles Result error case asynchronously by executing function.
 *
 * @typeParam TValue - Successful result value type.
 * @typeParam TError - Error type extending AppError.
 * @param fn - Async function to process error.
 * @returns A function that accepts a Result and returns a Promise resolving to unchanged Result.
 */
export function tapErrAsync<TValue, TError extends AppError>(
  fn: (e: TError) => Promise<void>,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError>> {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TError>> => {
    if (!r.ok) {
      return fn(r.error).then(() => r);
    }
    return Promise.resolve(r);
  };
}

/**
 * Handles Result errors by invoking async error handler safely.
 *
 * @typeParam TValue - Successful result value type.
 * @typeParam TError - Expected error type.
 * @typeParam TSideError - Side error type.
 * @param fn - Async function to handle error.
 * @param mapError - Transforms unknown errors.
 * @returns A function that accepts a Result and returns a Promise resolving to Result with original value or transformed error.
 */
export function tapErrSafeAsync<
  TValue,
  TError extends AppError,
  TSideError extends AppError,
>(
  fn: (e: TError) => Promise<void>,
  mapError: (e: unknown) => TSideError,
): (r: Result<TValue, TError>) => Promise<Result<TValue, TError | TSideError>> {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TValue, TError | TSideError>> => {
    if (r.ok) {
      return r;
    }
    try {
      await fn(r.error);
      return r;
    } catch (e) {
      return Err(mapError(e));
    }
  };
}

/**
 * Applies async function to successful value and flattens resulting Result.
 *
 * @typeParam TValue - Input value type.
 * @typeParam TNextValue - Resulting value type.
 * @typeParam TError - Initial error type.
 * @typeParam TNextError - Error type from function.
 * @param fn - Async function transforming value into Result.
 * @returns A function that accepts a Result and returns a Promise resolving to Result with transformed value or errors.
 */
export function flatMapAsync<
  TValue,
  TNextValue,
  TError extends AppError,
  TNextError extends AppError,
>(
  fn: (v: TValue) => Promise<Result<TNextValue, TNextError>>,
): (
  r: Result<TValue, TError>,
) => Promise<Result<TNextValue, TError | TNextError>> {
  return /* @__PURE__ */ (
    r: Result<TValue, TError>,
  ): Promise<Result<TNextValue, TError | TNextError>> =>
    r.ok ? fn(r.value) : Promise.resolve(r);
}

/**
 * Safely applies async transformation to Result value with error handling.
 *
 * @typeParam TValue - Input value type.
 * @typeParam TNextValue - Transformed value type.
 * @typeParam TError - Existing error type.
 * @typeParam TNextError - Error type from async function.
 * @typeParam TSideError - Error type from error mapper.
 * @param fn - Async function transforming Result value.
 * @param mapError - Maps unknown errors to TSideError.
 * @returns A function that accepts a Result and returns a Promise resolving to new Result with transformed or error value.
 */
export function flatMapSafeAsync<
  TValue,
  TNextValue,
  TError extends AppError,
  TNextError extends AppError,
  TSideError extends AppError,
>(
  fn: (v: TValue) => Promise<Result<TNextValue, TNextError>>,
  mapError: (e: unknown) => TSideError,
): (
  r: Result<TValue, TError>,
) => Promise<Result<TNextValue, TError | TNextError | TSideError>> {
  return /* @__PURE__ */ async (
    r: Result<TValue, TError>,
  ): Promise<Result<TNextValue, TError | TNextError | TSideError>> => {
    if (!r.ok) {
      return r;
    }
    try {
      return await fn(r.value);
    } catch (e) {
      return Err(mapError(e));
    }
  };
}

/**
 * Step function transforming Result<TValue, TError> → Result<TNextValue, TNextError>.
 */
export type PipeStep<
  TValue,
  TNextValue,
  TError extends AppError,
  TNextError extends AppError,
> = (
  r: Result<TValue, TError>,
) => Result<TNextValue, TNextError> | Promise<Result<TNextValue, TNextError>>;

export async function pipeAsync<
  TValue,
  TNextValue,
  TError extends AppError,
  TNextError extends AppError,
>(
  seed: Result<TValue, TError>,
  step1: PipeStep<TValue, TNextValue, TError, TNextError>,
): Promise<Result<TNextValue, TError | TNextError>>;

export async function pipeAsync<
  TValue,
  TValue2,
  TValue3,
  TError extends AppError,
  TError2 extends AppError,
  TError3 extends AppError,
>(
  seed: Result<TValue, TError>,
  step1: PipeStep<TValue, TValue2, TError, TError2>,
  step2: PipeStep<TValue2, TValue3, TError | TError2, TError3>,
): Promise<Result<TValue3, TError | TError2 | TError3>>;

export async function pipeAsync<
  TValue,
  TValue2,
  TValue3,
  TValue4,
  TError extends AppError,
  TError2 extends AppError,
  TError3 extends AppError,
  TError4 extends AppError,
>(
  seed: Result<TValue, TError>,
  step1: PipeStep<TValue, TValue2, TError, TError2>,
  step2: PipeStep<TValue2, TValue3, TError | TError2, TError3>,
  step3: PipeStep<TValue3, TValue4, TError | TError2 | TError3, TError4>,
): Promise<Result<TValue4, TError | TError2 | TError3 | TError4>>;

export async function pipeAsync<
  TValue,
  TValue2,
  TValue3,
  TValue4,
  TValue5,
  TError extends AppError,
  TError2 extends AppError,
  TError3 extends AppError,
  TError4 extends AppError,
  TError5 extends AppError,
  // biome-ignore lint/nursery/useMaxParams: <multistep pipe requires more params>
>(
  seed: Result<TValue, TError>,
  step1: PipeStep<TValue, TValue2, TError, TError2>,
  step2: PipeStep<TValue2, TValue3, TError | TError2, TError3>,
  step3: PipeStep<TValue3, TValue4, TError | TError2 | TError3, TError4>,
  step4: PipeStep<
    TValue4,
    TValue5,
    TError | TError2 | TError3 | TError4,
    TError5
  >,
): Promise<Result<TValue5, TError | TError2 | TError3 | TError4 | TError5>>;

export async function pipeAsync<E extends AppError>(
  // biome-ignore lint/suspicious/noExplicitAny: i think this is fine
  seed: Result<any, E>,
  // biome-ignore lint/suspicious/noExplicitAny: i think this is fine
  ...steps: readonly PipeStep<any, any, any, any>[]
  // biome-ignore lint/suspicious/noExplicitAny: i think this is fine
): Promise<Result<any, E>> {
  // biome-ignore lint/suspicious/noExplicitAny: i think this is fine
  let current: Result<any, E> = seed;

  for (const step of steps) {
    if (!current.ok) {
      break;
    }
    try {
      // biome-ignore lint/performance/noAwaitInLoops: sequential execution is intended
      current = await step(current);
    } catch (e) {
      // If a step throws or rejects instead of returning a Result,
      // we treat it as an unhandled error.
      // Note: In a production app, we'd ideally use a proper error factory here.
      // biome-ignore lint/complexity/noUselessCatch: keep for now
      throw e;
    }
  }

  return current;
}
