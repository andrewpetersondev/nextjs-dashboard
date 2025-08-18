import "server-only";

import { format, isValid, parse } from "date-fns";
import {
  INVOICE_STATUSES,
  type InvoiceStatus,
} from "@/features/invoices/invoice.types";
import {
  INTERVAL_DURATIONS,
  type IntervalDuration,
  REVENUE_SOURCES,
  type RevenueSource,
} from "@/features/revenues/core/revenue.types";
import { USER_ROLES, type UserRole } from "@/features/users/user.types";
import { Err, Ok, type Result } from "@/lib/core/result.base";
import { ValidationError } from "@/lib/errors/errors";
import type {
  CustomerId,
  InvoiceId,
  Period,
  RevenueId,
  SessionId,
  UserId,
} from "@/lib/types/types.brands";
import {
  isValidDate,
  normalizeToFirstOfMonthUTC,
} from "@/lib/utils/date.utils";

/**
 * Compiled regex for UUID validation (cached for performance)
 */
const UUID_REGEX =
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
const validateUuid = (id: string, brandName: string): void => {
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

export function isUserIdSafe(value: unknown): value is UserId {
  return typeof value === "string" && UUID_REGEX.test(value);
}

/**
 * Generic enum validation function with improved type safety
 * @param value - The value to validate
 * @param enumValues - Array of valid enum values
 * @param enumName - Name of the enum for error messages
 * @returns The validated enum value
 * @throws {ValidationError} If the value is not in the enum
 */
const validateEnum = <T extends string>(
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

// --- ID validation functions ---

/**
 * Validates and converts a string to a branded CustomerId
 * @param id - The UUID string to validate
 * @returns A branded CustomerId
 * @throws {ValidationError} If the ID is invalid
 */
export const toCustomerId = (id: string): CustomerId => {
  validateUuid(id, "CustomerId");
  return id as CustomerId;
};

/**
 * Validates and converts a string to a branded UserId
 * @param id - The UUID string to validate
 * @returns A branded UserId
 * @throws {ValidationError} If the ID is invalid
 */
export const toUserId = (id: string): UserId => {
  validateUuid(id, "UserId");
  return id as UserId;
};

/**
 * Validates and converts a string to a branded InvoiceId
 * @param id - The UUID string to validate
 * @returns A branded InvoiceId
 * @throws {ValidationError} If the ID is invalid
 */
export const toInvoiceId = (id: string): InvoiceId => {
  validateUuid(id, "InvoiceId");
  return id as InvoiceId;
};

/**
 * Validates and converts a string to a branded RevenueId
 * @param id - The UUID string to validate
 * @returns A branded RevenueId
 * @throws {ValidationError} If the ID is invalid
 */
export const toRevenueId = (id: string): RevenueId => {
  validateUuid(id, "RevenueId");
  return id as RevenueId;
};

/**
 * Validates and converts a string to a branded SessionId
 * @param id - The UUID string to validate
 * @returns A branded SessionId
 * @throws {ValidationError} If the ID is invalid
 */
export const toSessionId = (id: string): SessionId => {
  validateUuid(id, "SessionId");
  return id as SessionId;
};

// --- Enum validation functions ---

/**
 * Validates and converts a value to a UserRole
 * @param role - The role value to validate
 * @returns A validated UserRole
 * @throws {ValidationError} If the role is invalid
 */
export const toUserRole = (role: unknown): UserRole => {
  return validateEnum(role, USER_ROLES, "UserRole");
};

/**
 * Validates and converts a value to an InvoiceStatus
 * @param status - The status value to validate
 * @returns A validated InvoiceStatus
 * @throws {ValidationError} If the status is invalid
 */
export const toInvoiceStatus = (status: unknown): InvoiceStatus => {
  return validateEnum(status, INVOICE_STATUSES, "InvoiceStatus");
};

/**
 * Validates and converts a value to an IntervalDuration
 * @param duration - The duration value to validate
 * @returns A validated IntervalDuration
 * @throws {ValidationError} If the duration is invalid
 */
export const toIntervalDuration = (duration: unknown): IntervalDuration => {
  return validateEnum(duration, INTERVAL_DURATIONS, "IntervalDuration");
};

/**
 * Validates and converts a value to a RevenueSource
 * @param source - The source value to validate
 * @returns A validated RevenueSource
 * @throws {ValidationError} If the source is invalid
 */
export const toRevenueSource = (source: unknown): RevenueSource => {
  return validateEnum(source, REVENUE_SOURCES, "RevenueSource");
};

// --- Period validation ---

/**
 * Normalizes an input into a branded Period (first-of-month Date in UTC)
 * @param input - Date object, "yyyy-MM", or "yyyy-MM-dd" string
 * @returns A branded Period representing the first day of the month
 * @throws {ValidationError} If the input cannot be parsed or normalized
 */
export function toPeriod(input: Date | string): Period {
  if (input instanceof Date) {
    if (!isValidDate(input)) {
      throw new ValidationError("Invalid Date provided for period conversion");
    }
    return normalizeToFirstOfMonthUTC(input) as Period;
  }

  if (typeof input === "string") {
    // Try yyyy-MM format first
    let parsed = parse(input, "yyyy-MM", new Date());
    if (isValid(parsed) && format(parsed, "yyyy-MM") === input) {
      return normalizeToFirstOfMonthUTC(parsed) as Period;
    }

    // Try yyyy-MM-dd format (must be first day of month)
    parsed = parse(input, "yyyy-MM-dd", new Date());
    if (isValid(parsed) && format(parsed, "yyyy-MM-dd") === input) {
      if (parsed.getUTCDate() !== 1) {
        throw new ValidationError(
          `Period date must be the first day of the month, got: "${input}"`,
        );
      }
      return normalizeToFirstOfMonthUTC(parsed) as Period;
    }

    throw new ValidationError(
      `Invalid period format: "${input}". Expected "yyyy-MM" or "yyyy-MM-01"`,
    );
  }

  throw new ValidationError(
    `Unsupported period input type: ${typeof input}. Expected Date or string`,
  );
}

// --- Type guards ---

/**
 * Type guard to check if a value is a valid UUID string
 * @param value - The value to check
 * @returns True if the value is a valid UUID string
 */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

/**
 * Type guard to check if a value is a valid CustomerId
 * @param value - The value to check
 * @returns True if the value is a valid CustomerId
 */
export function isCustomerId(value: unknown): value is CustomerId {
  return isUuid(value);
}

/**
 * Type guard to check if a value is a valid UserId
 * @param value - The value to check
 * @returns True if the value is a valid UserId
 */
export function isUserId(value: unknown): value is UserId {
  return isUuid(value);
}

/**
 * Type guard to check if a value is a valid InvoiceId
 * @param value - The value to check
 * @returns True if the value is a valid InvoiceId
 */
export function isInvoiceId(value: unknown): value is InvoiceId {
  return isUuid(value);
}

/**
 * Type guard to check if a value is a valid RevenueId
 * @param value - The value to check
 * @returns True if the value is a valid RevenueId
 */
export function isRevenueId(value: unknown): value is RevenueId {
  return isUuid(value);
}

/**
 * Type guard to check if a value is a valid SessionId
 * @param value - The value to check
 * @returns True if the value is a valid SessionId
 */
export function isSessionId(value: unknown): value is SessionId {
  return isUuid(value);
}

/**
 * Type guard to check if a value is a valid UserRole
 * @param value - The value to check
 * @returns True if the value is a valid UserRole
 */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

/**
 * Type guard to check if a value is a valid InvoiceStatus
 * @param value - The value to check
 * @returns True if the value is a valid InvoiceStatus
 */
export function isInvoiceStatus(value: unknown): value is InvoiceStatus {
  return (
    typeof value === "string" &&
    INVOICE_STATUSES.includes(value as InvoiceStatus)
  );
}

/**
 * Type guard to check if a value is a valid IntervalDuration
 * @param value - The value to check
 * @returns True if the value is a valid IntervalDuration
 */
export function isIntervalDuration(value: unknown): value is IntervalDuration {
  return (
    typeof value === "string" &&
    INTERVAL_DURATIONS.includes(value as IntervalDuration)
  );
}

/**
 * Type guard to check if a value is a valid RevenueSource
 * @param value - The value to check
 * @returns True if the value is a valid RevenueSource
 */
export function isRevenueSource(value: unknown): value is RevenueSource {
  return (
    typeof value === "string" &&
    REVENUE_SOURCES.includes(value as RevenueSource)
  );
}

/**
 * Type guard to check if a value is a valid Period (first-of-month Date)
 * @param value - The value to check
 * @returns True if the value is a valid Period
 */
export function isPeriod(value: unknown): value is Period {
  return value instanceof Date && isValid(value) && value.getUTCDate() === 1;
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
