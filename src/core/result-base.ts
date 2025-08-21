/**
 * Discriminated union for success or failure.
 *
 * @typeParam T - Success data.
 * @typeParam E - Error value. Defaults to `Error`.
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * Success constructor.
 * @typeParam T - Success data type.
 * @param data - Value to wrap.
 * @returns Ok result.
 */
export const Ok = <T>(data: T): Result<T, never> =>
  ({ data, success: true }) as const;

/**
 * Error constructor.
 * @typeParam E - Error type.
 * @param error - Error to wrap.
 * @returns Err result.
 */
export const Err = <E>(error: E): Result<never, E> =>
  ({ error, success: false }) as const;

// Type guards

/**
 * Type guard for success branch.
 * @typeParam T - Success data type.
 * @typeParam E - Error type.
 * @param r - Result to test.
 * @returns True if success.
 */
export const isOk = <T, E>(r: Result<T, E>): r is { success: true; data: T } =>
  r.success;

/**
 * Type guard for error branch.
 * @typeParam T - Success data type.
 * @typeParam E - Error type.
 * @param r - Result to test.
 * @returns True if error.
 */
export const isErr = <T, E>(
  r: Result<T, E>,
): r is { success: false; error: E } => !r.success;
