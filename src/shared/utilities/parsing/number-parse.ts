import type { AppError } from "@/shared/errors/core/app-error";
import { makeValidationError } from "@/shared/errors/factories/app-error";
import { Err } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";
import { fromPredicate } from "@/shared/result/sync/result-sync";

/**
 * Safely parse a string to an integer, returning a Result.
 *
 * @param value - The string value to parse.
 * @param radix - Optional radix (default: 10).
 * @returns A Result containing the parsed integer or an AppError if parsing fails or produces NaN.
 */
export function parseIntResult(
  value: string,
  radix = 10,
): Result<number, AppError> {
  const trimmed = value.trim();
  if (trimmed === "") {
    return Err(
      makeValidationError({
        message: "Cannot parse empty string to integer",
        metadata: { radix, value },
      }),
    );
  }

  const parsed = Number.parseInt(trimmed, radix);

  return fromPredicate(
    parsed,
    (n) => !Number.isNaN(n),
    () =>
      makeValidationError({
        message: `Failed to parse "${value}" as integer`,
        metadata: { radix, value },
      }),
  );
}

/**
 * Safely parse a string to a float, returning a Result.
 *
 * @param value - The string value to parse.
 * @returns A Result containing the parsed float or an AppError if parsing fails or produces NaN.
 */
export function parseFloatResult(value: string): Result<number, AppError> {
  const trimmed = value.trim();
  if (trimmed === "") {
    return Err(
      makeValidationError({
        message: "Cannot parse empty string to float",
        metadata: { value },
      }),
    );
  }

  const parsed = Number.parseFloat(trimmed);

  return fromPredicate(
    parsed,
    (n) => !Number.isNaN(n),
    () =>
      makeValidationError({
        message: `Failed to parse "${value}" as float`,
        metadata: { value },
      }),
  );
}

/**
 * Safely convert a value to a number, returning a Result.
 *
 * @param value - The value to convert.
 * @returns A Result containing the number or an AppError if conversion produces NaN.
 */
export function toNumberResult(value: unknown): Result<number, AppError> {
  if (typeof value === "number") {
    return fromPredicate(
      value,
      (n) => !Number.isNaN(n),
      () =>
        makeValidationError({
          message: "Value is NaN",
          metadata: { value },
        }),
    );
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return Err(
        makeValidationError({
          message: "Cannot convert empty string to number",
          metadata: { value },
        }),
      );
    }
    const num = Number(trimmed);
    return fromPredicate(
      num,
      (n) => !Number.isNaN(n),
      () =>
        makeValidationError({
          message: `Failed to convert "${value}" to number`,
          metadata: { value },
        }),
    );
  }

  return Err(
    makeValidationError({
      message: "Cannot convert value to number",
      metadata: {
        actualType: typeof value,
      },
    }),
  );
}

/**
 * Validate that a number is within a specified range.
 *
 * @param value - The number to validate.
 * @param min - The minimum allowed value (inclusive).
 * @param max - The maximum allowed value (inclusive).
 * @returns A Result containing the number or an AppError if out of range.
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
): Result<number, AppError> {
  return fromPredicate(
    value,
    (n) => n >= min && n <= max,
    (n) =>
      makeValidationError({
        message: `Number ${n} is out of range [${min}, ${max}]`,
        metadata: { max, min, value: n },
      }),
  );
}

/**
 * Validate that a number is positive (> 0).
 *
 * @param value - The number to validate.
 * @returns A Result containing the number or an AppError if not positive.
 */
export function validatePositive(value: number): Result<number, AppError> {
  return fromPredicate(
    value,
    (n) => n > 0,
    (n) =>
      makeValidationError({
        message: `Expected positive number, got ${n}`,
        metadata: {
          value: n,
        },
      }),
  );
}

/**
 * Validate that a number is non-negative (>= 0).
 *
 * @param value - The number to validate.
 * @returns A Result containing the number or an AppError if negative.
 */
export function validateNonNegative(value: number): Result<number, AppError> {
  return fromPredicate(
    value,
    (n) => n >= 0,
    (n) =>
      makeValidationError({
        message: `Expected non-negative number, got ${n}`,
        metadata: {
          value: n,
        },
      }),
  );
}

/**
 * Validate that a number is an integer.
 *
 * @param value - The number to validate.
 * @returns A Result containing the number or an AppError if not an integer.
 */
export function validateInteger(value: number): Result<number, AppError> {
  return fromPredicate(
    value,
    (n) => Number.isInteger(n),
    (n) =>
      makeValidationError({
        message: `Expected integer, got ${n}`,
        metadata: {
          value: n,
        },
      }),
  );
}
