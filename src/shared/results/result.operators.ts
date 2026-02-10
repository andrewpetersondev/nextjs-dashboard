import type { AppError } from "@/shared/errors/core/app-error.entity";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Transforms the value of an `Ok` result using the provided function, maintaining the `Err` state otherwise.
 *
 * @typeParam T - The input success value type.
 * @typeParam U - The output success value type.
 * @typeParam E - The error type, constrained to `AppError`.
 * @param fn - A function to apply to the `Ok` result's value.
 * @returns A function that maps a `Result<T, E>` to `Result<U, E>`.
 */
export function map<T, U, E extends AppError>(
  fn: (v: T) => U,
): (r: Result<T, E>) => Result<U, E> {
  return function mapOk(r: Result<T, E>): Result<U, E> {
    return r.ok ? Ok(fn(r.value)) : r;
  };
}

/**
 * Maps an error value using the provided function if the result is an error.
 *
 * @typeParam T - The success value type.
 * @typeParam E1 - The original error type.
 * @typeParam E2 - The mapped error type.
 * @param fn - A function that transforms the error value.
 * @returns A function that maps a `Result<T, E1>` to `Result<T, E2>`.
 */
export function mapErr<T, E1 extends AppError, E2 extends AppError>(
  fn: (e: E1) => E2,
): (r: Result<T, E1>) => Result<T, E2> {
  return function mapErrInner(r: Result<T, E1>): Result<T, E2> {
    return r.ok ? r : Err(fn(r.error));
  };
}

/**
 * Transforms both the success (`Ok`) and error (`Err`) states of a result.
 *
 * @typeParam T - The type of the success value.
 * @typeParam U - The type after transforming the success value.
 * @typeParam E1 - The original error type.
 * @typeParam E2 - The transformed error type.
 * @param onOk - Function to map the success (`Ok`) value.
 * @param onErr - Function to map the error (`Err`) value.
 * @returns A function that takes a result and transforms it using the provided mappings.
 */
export function mapBoth<T, U, E1 extends AppError, E2 extends AppError>(
  onOk: (v: T) => U,
  onErr: (e: E1) => E2,
): (r: Result<T, E1>) => Result<U, E2> {
  return function mapBothInner(r: Result<T, E1>): Result<U, E2> {
    return r.ok ? Ok(onOk(r.value)) : Err(onErr(r.error));
  };
}

/**
 * Maps an error of type `E1` to a new error of type `E2` within a `Result`.
 *
 * @typeParam T - The success value type.
 * @typeParam E1 - The original error type.
 * @typeParam E2 - The mapped error type.
 * @param fn - A function transforming `E1` into `E2`.
 * @returns A function that maps a `Result<T, E1>` to `Result<T, E1 | E2>`.
 */
export function mapErrUnion<T, E1 extends AppError, E2 extends AppError>(
  fn: (e: E1) => E2,
): (r: Result<T, E1>) => Result<T, E1 | E2> {
  return function mapErrUnionInner(r: Result<T, E1>): Result<T, E1 | E2> {
    return r.ok ? r : Err(fn(r.error));
  };
}

/**
 * Maps an error from a `Result` type to a new error type while preserving the original error instance
 * if the mapping returns the very same instance.
 *
 * @typeParam T - The success value type.
 * @typeParam E1 - The original error type.
 * @typeParam E2 - The mapped error type.
 * @param fn - A transformation function to map the error from `E1` to `E2`.
 * @returns A function that maps a `Result<T, E1>` to `Result<T, E1 | E2>`, preserving the original `Err` object when unchanged.
 */
export function mapErrPreserve<T, E1 extends AppError, E2 extends AppError>(
  fn: (e: E1) => E2,
): (r: Result<T, E1>) => Result<T, E1 | E2> {
  return function mapErrPreserveInner(r: Result<T, E1>): Result<T, E1 | E2> {
    if (r.ok) {
      return r;
    }
    const mapped = fn(r.error);
    return Object.is(mapped, r.error) ? r : Err(mapped);
  };
}

/**
 * Executes a provided function if the `Result` is successful (`ok`), passing its value.
 * Returns the original `Result` unchanged.
 *
 * @typeParam Tv - The type of the success value.
 * @typeParam Te - The error type in the result, extending `AppError`.
 * @param fn - Function invoked with the success value for side effects.
 * @returns A function that accepts a `Result<Tv, Te>` and returns the same `Result`.
 */
export function tap<Tv, Te extends AppError>(
  fn: (v: Tv) => void,
): (r: Result<Tv, Te>) => Result<Tv, Te> {
  return function tapInner(r: Result<Tv, Te>): Result<Tv, Te> {
    if (r.ok) {
      fn(r.value);
    }
    return r;
  };
}

/**
 * Applies a side-effect function to the error of a `Result` if it is not ok.
 * Returns the original `Result` unchanged.
 *
 * @typeParam Tv - The type of the success value.
 * @typeParam Te - The error type in the result, extending `AppError`.
 * @param fn - Function invoked with the error for side effects.
 * @returns A function that accepts a `Result<Tv, Te>` and returns the same `Result`.
 */
export function tapErr<Tv, Te extends AppError>(
  fn: (e: Te) => void,
): (r: Result<Tv, Te>) => Result<Tv, Te> {
  return function tapErrInner(r: Result<Tv, Te>): Result<Tv, Te> {
    if (!r.ok) {
      fn(r.error);
    }
    return r;
  };
}

/**
 * Safely applies a given side-effect function to the success value of a `Result`.
 * If the side-effect throws, the thrown value is mapped to a `Ts` error and returned as `Err`.
 *
 * @typeParam Tv - The type of the success value.
 * @typeParam Te - The original error type in the result, extending `AppError`.
 * @typeParam Ts - The side-effect error type produced by `mapError`, extending `AppError`.
 * @param fn - Side-effect function to run when the `Result` is `Ok`.
 * @param mapError - Function that maps an unknown thrown value to a `Ts`.
 * @returns A function that accepts a `Result<Tv, Te>` and returns `Result<Tv, Te | Ts>`.
 */
export function tapSafe<Tv, Te extends AppError, Ts extends AppError>(
  fn: (v: Tv) => void,
  mapError: (e: unknown) => Ts,
): (r: Result<Tv, Te>) => Result<Tv, Te | Ts> {
  return function tapSafeInner(r: Result<Tv, Te>): Result<Tv, Te | Ts> {
    if (r.ok) {
      try {
        fn(r.value);
      } catch (e) {
        const sideErr = mapError(e);
        return Err(sideErr);
      }
    }
    return r;
  };
}

/**
 * Safely taps into the error of a `Result`, applying a function and mapping any thrown values
 * to a side-effect error.
 *
 * @typeParam Tv - The type of the success value.
 * @typeParam Te - The original error type in the result, extending `AppError`.
 * @typeParam Ts - The side-effect error type produced by `mapError`, extending `AppError`.
 * @param fn - Side-effect function invoked when the `Result` is `Err`.
 * @param mapError - Function that maps an unknown thrown value to a `Ts`.
 * @returns A function that accepts a `Result<Tv, Te>` and returns `Result<Tv, Te | Ts>`.
 */
export function tapErrSafe<Tv, Te extends AppError, Ts extends AppError>(
  fn: (e: Te) => void,
  mapError: (e: unknown) => Ts,
): (r: Result<Tv, Te>) => Result<Tv, Te | Ts> {
  return function tapErrSafeInner(r: Result<Tv, Te>): Result<Tv, Te | Ts> {
    if (!r.ok) {
      try {
        fn(r.error);
      } catch (e) {
        const sideErr = mapError(e);
        return Err(sideErr);
      }
    }
    return r;
  };
}

/**
 * Applies a transformation function to the value of a successful `Result`,
 * flattening the nested `Result` output into a single layer.
 *
 * @typeParam T - The type of the input value in the `Result`.
 * @typeParam U - The type of the output value after applying the transformation.
 * @typeParam E - The type of the original error in the `Result`, extending `AppError`.
 * @typeParam F - The type of the error that may arise during the transformation, extending `AppError`.
 * @param fn - A function that transforms a `T` into a `Result<U, F>`.
 * @returns A function that accepts a `Result<T, E>` and returns a `Result<U, E | F>`,
 *          producing the transformed `Ok` value or propagating the first encountered `Err`.
 */
export function flatMap<T, U, E extends AppError, F extends AppError>(
  fn: (v: T) => Result<U, F>,
): (r: Result<T, E>) => Result<U, E | F> {
  return function flatMapInner(r: Result<T, E>): Result<U, E | F> {
    return r.ok ? fn(r.value) : r;
  };
}

/**
 * Extracts the value from a successful `Result` or throws the associated error if unsuccessful.
 *
 * @typeParam T - The type of the value in case of success.
 * @typeParam E - The type of the error, extending `AppError`.
 * @param r - A `Result` object containing either a success value or an error.
 * @returns The contained value of type `T` when `r.ok` is true.
 * @throws The error of type `E` when `r.ok` is false.
 */
export function unwrapOrThrow<T, E extends AppError>(r: Result<T, E>): T {
  if (r.ok) {
    return r.value;
  }
  throw r.error;
}

/**
 * Returns the value from a `Result` if `ok`, otherwise returns the provided fallback.
 *
 * @typeParam T - The type of the successful result value.
 * @typeParam E - The type of the error, extending `AppError`.
 * @param fallback - The default value to return if the `Result` is not `ok`.
 * @returns A function that accepts a `Result<T, E>` and returns `T` or the `fallback`.
 */
export function unwrapOr<T, E extends AppError>(
  fallback: T,
): (r: Result<T, E>) => T {
  return function unwrapOrInner(r: Result<T, E>): T {
    return r.ok ? r.value : fallback;
  };
}

/**
 * Returns the value of a successful `Result` or computes a fallback value using the provided function.
 *
 * @typeParam T - The type of the successful value contained in the `Result`.
 * @typeParam E - The type of the error contained in the `Result`, extending `AppError`.
 * @param fallback - A function that computes a fallback value from the error `E`.
 * @returns A function that accepts a `Result<T, E>` and returns `T` either from the result or computed via `fallback`.
 */
export function unwrapOrElse<T, E extends AppError>(
  fallback: (e: E) => T,
): (r: Result<T, E>) => T {
  return function unwrapOrElseInner(r: Result<T, E>): T {
    return r.ok ? r.value : fallback(r.error);
  };
}

/**
 * Matches a `Result` and applies the appropriate callback based on its state.
 *
 * @typeParam T - The type of the successful result's value.
 * @typeParam E - The type of the error, extending `AppError`.
 * @typeParam O - The return type of the callback functions.
 * @param r - The `Result` object to match.
 * @param onOk - Callback invoked with the value when `r` is `Ok`.
 * @param onErr - Callback invoked with the error when `r` is `Err`.
 * @returns The return value of either `onOk` or `onErr`.
 */
export function match<T, E extends AppError, O>(
  r: Result<T, E>,
  onOk: (v: T) => O,
  onErr: (e: E) => O,
): O {
  return r.ok ? onOk(r.value) : onErr(r.error);
}

/**
 * Exhaustive match that returns a constant output based on the `Result` state.
 *
 * @typeParam T - The type of the successful result's value.
 * @typeParam E - The type of the error, extending `AppError`.
 * @typeParam O - The constant output type for both branches.
 * @param onOk - Constant value to return when `r` is `Ok`.
 * @param onErr - Constant value to return when `r` is `Err`.
 * @returns A function that accepts a `Result<T, E>` and returns either `onOk` or `onErr`.
 */
export function matchTo<T, E extends AppError, O>(
  onOk: O,
  onErr: O,
): (r: Result<T, E>) => O {
  return function matchToInner(r: Result<T, E>): O {
    return r.ok ? onOk : onErr;
  };
}
