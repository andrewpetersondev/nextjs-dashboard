# Phase 1

### Phase 1: Foundation Infrastructure (Days 1-3)

Start with the absolute core utilities that everything else depends on.

#### 1.1 Core Types & Result Pattern (`src/lib/core/`)

~~~typescript
// src/lib/core/result.ts
/**
 * Represents the result of an operation that can either succeed or fail.
 * This replaces throwing exceptions for expected error cases.
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export const Ok = <T>(data: T): Result<T, never> =>
  ({
    success: true,
    data,
  }) as const;

export const Err = <E>(error: E): Result<never, E> =>
  ({
    success: false,
    error,
  }) as const;

/**
 * Utility to safely unwrap a Result, throwing if it's an error.
 * Use sparingly - prefer pattern matching with success/error checks.
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.success) return result.data;
  throw result.error;
};

/**
 * Maps the success value of a `Result` to a new value.
 *
 * @typeParam T - The type of the original success value.
 * @typeParam U - The type of the mapped success value.
 * @typeParam E - The type of the error.
 * @param result - The `Result` to map over.
 * @param fn - A function to transform the success value.
 * @returns A new `Result` with the mapped value if successful, or the original error.
 *
 * @example
 * ```ts
 * const result: Result<number, Error> = Ok(2);
 * const mapped = mapResult(result, n => n * 2); // Ok(4)
 * ```
 */
export const mapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> => {
  return result.success ? Ok(fn(result.data)) : result;
};

/**
 * Chains `Result` values together, enabling sequential operations where each step may fail.
 *
 * If the input `result` is successful, applies the provided function to its value and returns the next `Result`.
 * If the input `result` is an error, returns it unchanged.
 *
 * @typeParam T - The type of the original success value.
 * @typeParam U - The type of the next success value.
 * @typeParam E - The error type, which must be consistent across all chained operations.
 * @param result - The `Result` to chain from.
 * @param fn - A function that takes the success value and returns a new `Result`.
 * @returns The next `Result` if successful, or the original error.
 *
 * @example
 * ```ts
 * const parse = (input: string): Result<number, Error> =>
 *   isNaN(Number(input)) ? Err(new Error("Not a number")) : Ok(Number(input));
 *
 * const double = (n: number): Result<number, Error> => Ok(n * 2);
 *
 * const result = flatMapResult(parse("42"), double); // Ok(84)
 * ```
 */
export const flatMapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> => {
  return result.success ? fn(result.data) : result;
};
~~~

#### 1.2 Brand Types System (`src/lib/core/brand.ts`)

~~~typescript
// src/lib/core/brand.ts
/**
 * Creates a symbol-constrained branded type to prevent mixing incompatible values.
 * Symbols ensure true uniqueness at both compile-time and runtime.
 *
 * @template T - The underlying type being branded
 * @template B - The brand symbol type for uniqueness
 *
 * @example
 * ```ts
 * const userIdBrand = Symbol('UserId');
 * type UserId = Brand<string, typeof userIdBrand>;
 *
 * const createUserId = (value: string): UserId => value as UserId;
 * const userId = createUserId('user-123');
 * ```
 */
export type Brand<T, B extends symbol> = T & { readonly __brand: B };

/**
 * Creates a branded value factory function for a specific symbol.
 * Provides type-safe branding with runtime symbol validation capability.
 *
 * @param brandSymbol - The unique symbol for this brand
 * @returns Factory function that creates branded values
 * @example
 * ```ts
 * export const USER_ID_BRAND = Symbol("UserId");
 * export type UserId = Brand<string, typeof USER_ID_BRAND>;
 * const brandUserId = createBrand(USER_ID_BRAND);
 * ```
 * @template T - The underlying type being branded
 * @template B - The brand symbol type for uniqueness
 * @return A function that takes a value of type T and returns a Brand<T, B>
 *
 */
export const createBrand = <T, B extends symbol>(brandSymbol: B) => {
  return (value: T): Brand<T, B> => value as Brand<T, B>;
};

/**
 * Type guard to check if a value has a specific brand.
 * Useful for runtime brand validation in complex scenarios.
 *
 * @param value - The value to check
 * @param validator - Function to validate the underlying type
 * @returns True if value matches the brand type
 */
export const isBrand = <T, B extends symbol>(
  value: unknown,
  validator: (v: unknown) => v is T,
): value is Brand<T, B> => validator(value);

/**
 * Extracts the underlying value from a branded type.
 * Use sparingly - prefer keeping values branded throughout the system.
 *
 * @param brandedValue - The branded value to unwrap
 * @returns The underlying unbranded value
 */
export const unbrand = <T, B extends symbol>(brandedValue: Brand<T, B>): T =>
  brandedValue as T;
~~~

