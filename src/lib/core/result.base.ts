/**
 * Core Result primitives: type, constructors, type guards.
 */

/**
 * Represents the result of an operation that can either succeed or fail.
 *
 * This type is useful for handling outcomes in a type-safe manner, avoiding
 * the need for exceptions. It employs a discriminated union with two possible
 * shapes:
 * - A successful result containing the associated data (`data`) with `success` set to `true`.
 * - A failed result containing the associated error (`error`) with `success` set to `false`.
 *
 * @typeParam T - The type of the value returned when the operation is successful.
 * @typeParam E - The type of the error returned when the operation fails. Defaults to `Error`.
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * A generic utility function that wraps the provided `data` in a success result object.
 *
 * @template T - The type of the data to be wrapped in the success result.
 * @param data - The data to be included in the success result.
 * @returns A success result object containing the provided `data` and a success status.
 */
export const Ok = <T>(data: T): Result<T, never> =>
  ({ data, success: true }) as const;

/**
 * A utility function to create a failed `Result` object.
 *
 * @template E The type of the error to encapsulate within the `Result`.
 *
 * @param error The error value to include in the `Result`.
 * @returns A `Result` object that contains the error information and is marked as unsuccessful.
 *
 * This function is used to represent an operation that has failed and includes the related error in the result.
 */
export const Err = <E>(error: E): Result<never, E> =>
  ({ error, success: false }) as const;

// Type guards

/**
 * A type guard function that checks if a `Result` object represents a successful operation.
 *
 * This function determines whether the given `Result` object has a `success` property set to `true`
 * and contains the valid `data` of type `T`. If the provided `Result` object satisfies these
 * conditions, the function returns `true`; otherwise, it returns `false`.
 *
 * @template T - The type of the data contained in the successful `Result` object.
 * @template E - The type of the error contained in the unsuccessful `Result` object.
 *
 * @param r - The `Result` object to be evaluated. It can either represent a successful operation
 *            containing the data (`success: true, data: T`) or an unsuccessful operation
 *            containing an error (`success: false, error: E`).
 * @returns `true` if the `Result` object represents a successful operation containing valid data,
 *          otherwise `false`.
 */
export const isOk = <T, E>(r: Result<T, E>): r is { success: true; data: T } =>
  r.success;

/**
 * A type guard function that checks if a given `Result` object represents an error state.
 *
 * @typeParam T - The type of the success value in the `Result`.
 * @typeParam E - The type of the error value in the `Result`.
 * @param r - A `Result` object to be checked.
 * @returns A boolean indicating whether the provided `Result` is in an error state. If `true`, the object
 *          is narrowed to a type with `success: false` and an `error` property of type `E`.
 */
export const isErr = <T, E>(
  r: Result<T, E>,
): r is { success: false; error: E } => !r.success;
