/**
 * Discriminated union for success or failure.
 *
 * Use a domain-appropriate, serializable error type for `E` at module boundaries
 * (e.g., form validation errors or error DTOs). Reserve `Error` for internal/server flows
 * and prefer mapping to a transport-friendly shape before returning to UI.
 *
 * Prefer constructing results via {@link Ok} and {@link Err} to preserve literal discriminants
 * and avoid boolean widening from ad-hoc object literals.
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

/**
 * Error constructor for validation scenarios producing field-error maps or similar serializable shapes.
 * @typeParam TError - Validation error map shape.
 * @param errors - Validation error payload.
 * @returns Err result with validation error payload.
 */
export const ErrValidation = <TError>(errors: TError): Result<never, TError> =>
  ({ error: errors, success: false }) as const;

/**
 * Public-facing Result preset with a serializable error default.
 *
 * Use this at API/UI boundaries to default E away from `Error`.
 * Keep `Result<T, E>` for internal/server flows, or override E explicitly.
 *
 * @example
 * type ApiRes = ResultPublic<UserDto>; // error defaults to { code; message }
 * type ApiResWithUnion = ResultPublic<UserDto, ValidationError | DatabaseError>;
 */
export type ResultPublic<T, E = { code: string; message: string }> = Result<
  T,
  E
>;

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
