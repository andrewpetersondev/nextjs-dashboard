import { format, isValid, parse } from "date-fns";
import { Err, Ok, type Result } from "@/lib/core/result.base";
import { ValidationError } from "@/lib/errors/errors";
import {
  isValidDate,
  normalizeToFirstOfMonthUTC,
} from "@/lib/utils/date.utils";

/**
 * Compiled regex for UUID validation (cached for performance)
 */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Brand<T, B extends symbol> = T & { readonly __brand: B };

/**
 * Create a branded type for stricter type safety.
 */
export const createBrand = <T, B extends symbol>(_brandSymbol: B) => {
  return (value: T): Brand<T, B> => value as Brand<T, B>;
};

export const isBrand = <T, B extends symbol>(
  value: unknown,
  validator: (v: unknown) => v is T,
): value is Brand<T, B> => validator(value);

export const unbrand = <T, B extends symbol>(brandedValue: Brand<T, B>): T =>
  brandedValue as T;

/**
 * Validates that a string is a valid UUID format
 * (Throw-based for backward compatibility)
 */
export const validateUuid = (id: string, brandName: string): void => {
  const r = validateUuidResult(id, brandName);
  if (!r.success) {
    throw r.error;
  }
};

/**
 * Validate if the input is a properly formatted UUID. (Result-based)
 */
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
 * Generic enum validation (Result-based)
 */
export const validateEnumResult = <T extends string>(
  value: unknown,
  enumValues: readonly T[],
  enumName: string,
): Result<T, ValidationError> => {
  if (typeof value !== "string") {
    return Err(
      new ValidationError(
        `Invalid ${enumName}: expected string, got ${typeof value}`,
      ),
    );
  }
  const candidate = value as T;
  if (enumValues.includes(candidate)) {
    return Ok(candidate);
  }
  return Err(
    new ValidationError(
      `Invalid ${enumName}: "${value}". Allowed values: ${enumValues.join(", ")}`,
    ),
  );
};

/**
 * Generic enum validation (throw-based wrapper for backward compatibility)
 */
export const validateEnum = <T extends string>(
  value: unknown,
  enumValues: readonly T[],
  enumName: string,
): T => {
  const r = validateEnumResult(value, enumValues, enumName);
  if (r.success) return r.data;
  throw r.error;
};

// --- Period validation ---

/**
 * Result-based normalization into a first-of-month UTC Date.
 */
export function validatePeriodResult(
  input: unknown,
): Result<Date, ValidationError> {
  if (input instanceof Date) {
    if (!isValidDate(input)) {
      return Err(
        new ValidationError("Invalid Date provided for period conversion"),
      );
    }
    return Ok(normalizeToFirstOfMonthUTC(input));
  }

  if (typeof input === "string") {
    // Try yyyy-MM format first
    let parsed = parse(input, "yyyy-MM", new Date());
    if (isValid(parsed) && format(parsed, "yyyy-MM") === input) {
      return Ok(normalizeToFirstOfMonthUTC(parsed));
    }

    // Try yyyy-MM-dd format (must be first day of month)
    parsed = parse(input, "yyyy-MM-dd", new Date());
    if (isValid(parsed) && format(parsed, "yyyy-MM-dd") === input) {
      if (parsed.getUTCDate() !== 1) {
        return Err(
          new ValidationError(
            `Period date must be the first day of the month, got: "${input}"`,
          ),
        );
      }
      return Ok(normalizeToFirstOfMonthUTC(parsed));
    }

    return Err(
      new ValidationError(
        `Invalid period format: "${input}". Expected "yyyy-MM" or "yyyy-MM-01"`,
      ),
    );
  }

  return Err(
    new ValidationError(
      `Unsupported period input type: ${typeof input}. Expected Date or string`,
    ),
  );
}

/**
 * Type guard to check if a value is a valid UUID string
 */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

// Common numeric validators used across revenue domain
export function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

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
