import "server-only";
import { Err, Ok, type Result } from "@/lib/core/result.base";
import { ValidationError } from "@/lib/errors/errors";

/**
 * Compiled regex for UUID validation (cached for performance)
 */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Build a branded type for type safety.
 *
 * Provides a unique symbol-based brand to distinguish the type from similar
 * structures, ensuring it is only used where intended.
 *
 * @typeParam T - Base type to extend with the brand.
 * @typeParam B - Unique symbol representing the brand.
 * @remarks
 * - The brand is applied via intersection with a readonly `__brand` property.
 * - Useful for creating uniquely-typed identifiers or ensuring stricter API typing.
 * - No runtime changes; branding only affects TypeScript type checking.
 * @example
 * ```typescript
 * declare const UserID: unique symbol;
 * type UserId = Brand<string, typeof UserID>;
 *
 * const id: UserId = "1234" as UserId; // Valid.
 * const invalidId: UserId = "1234";    // Error: Type 'string' is not assignable.
 * ```
 */
export type Brand<T, B extends symbol> = T & { readonly __brand: B };

/**
 * Create a branded type for stricter type safety.
 *
 * Ensures a value is cast to a `Brand<T, B>` type to distinguish it from similar types.
 *
 * @typeParam T - The underlying value type to brand.
 * @typeParam B - The symbol representing the unique brand.
 * @param _brandSymbol - The branding symbol (not used at runtime, only for type distinction).
 * @returns A function that casts a value to the branded type.
 * @example
 * ```typescript
 * declare const userIdBrand: unique symbol;
 * type UserId = Brand<string, typeof userIdBrand>;
 *
 * const createUserId = createBrand<string, typeof userIdBrand>(userIdBrand);
 * const id: UserId = createUserId('12345'); // Valid
 * ```
 */
export const createBrand = <T, B extends symbol>(_brandSymbol: B) => {
  return (value: T): Brand<T, B> => value as Brand<T, B>;
};

/**
 * Type guard to validate if a value is a branded type.
 *
 * Ensures the value conforms to {@link Brand<T, B>} by verifying it satisfies the
 * provided type validator.
 *
 * @typeParam T - The underlying type of the value being checked.
 * @typeParam B - The branding symbol associated with the type.
 * @param value - The value to validate as a branded type.
 * @param validator - A predicate function to check if the value matches the base type.
 * @returns `true` if the value is a valid branded type, otherwise `false`.
 * @example
 * ```typescript
 * const isString = (v: unknown): v is string => typeof v === 'string';
 * const value = 'hello' as unknown;
 *
 * if (isBrand<string, typeof MyBrandSymbol>(value, isString)) {
 *   // value is now narrowed to Brand<string, typeof MyBrandSymbol>
 * }
 * ```
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

/**
 * Validates that a string is a valid UUID format
 * @param id - The string to validate
 * @param brandName - The brand name for error messages
 * @throws {ValidationError} If the ID is not a valid UUID
 */
export const validateUuid = (id: string, brandName: string): void => {
  if (typeof id !== "string") {
    throw new ValidationError(
      `Invalid ${brandName}: expected string, got ${typeof id}`,
    );
  }

  if (!UUID_REGEX.test(id)) {
    throw new ValidationError(
      `Invalid ${brandName}: "${id}". Must be a valid UUID format.`,
    );
  }
};

export const validateUuidResult = (
  value: unknown,
  label = "UserId",
): Result<string, ValidationError> => {
  if (typeof value !== "string") {
    return Err(
      new ValidationError(
        `Invalid ${label}: expected string, got ${typeof value}`,
      ),
    );
  }
  const v = value.trim();
  if (v.length === 0) {
    return Err(new ValidationError(`${label} cannot be empty`));
  }
  if (!UUID_REGEX.test(v)) {
    return Err(
      new ValidationError(
        `Invalid ${label}: "${value}". Must be a valid UUID format.`,
      ),
    );
  }
  return Ok(v);
};

/**
 * Generic enum validation function with improved type safety
 * @param value - The value to validate
 * @param enumValues - Array of valid enum values
 * @param enumName - Name of the enum for error messages
 * @returns The validated enum value
 * @throws {ValidationError} If the value is not in the enum
 */
export const validateEnum = <T extends string>(
  value: unknown,
  enumValues: readonly T[],
  enumName: string,
): T => {
  if (typeof value !== "string") {
    throw new ValidationError(
      `Invalid ${enumName}: expected string, got ${typeof value}`,
    );
  }

  if (enumValues.includes(value as T)) {
    return value as T;
  }

  throw new ValidationError(
    `Invalid ${enumName}: "${value}". Allowed values: ${enumValues.join(", ")}`,
  );
};

/**
 * Type guard to check if a value is a valid UUID string
 * @param value - The value to check
 * @returns True if the value is a valid UUID string
 */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

// Common numeric validators used across revenue domain
/**
 * Type guard to check if a value is a non-negative integer
 */
export function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/**
 * Type guard to check if a value is a non-negative finite number
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/**
 * Generic guard to check if a value is an integer within an inclusive range.
 * Keeps revenue validators DRY and intent-revealing.
 */
export function isIntegerInRange(
  value: unknown,
  minInclusive: number,
  maxInclusive: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    Number.isFinite(value) &&
    value >= minInclusive &&
    value <= maxInclusive
  );
}
