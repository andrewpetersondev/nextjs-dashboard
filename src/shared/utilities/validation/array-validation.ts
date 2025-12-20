import type { AppError } from "@/shared/errors/core/app-error";
import { makeValidationError } from "@/shared/errors/factories/app-error.factory";
import { Err } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";
import { collectAll } from "@/shared/result/sync/result-collect";
import { fromPredicate } from "@/shared/result/sync/result-sync";

/**
 * Validate that an array is non-empty.
 *
 * @typeParam T - The array element type.
 * @param value - The array to validate.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the non-empty array or an AppError.
 */
export function validateNonEmptyArray<T>(
  value: T[],
  fieldName = "Array",
): Result<T[], AppError> {
  return fromPredicate(
    value,
    (arr) => arr.length > 0,
    () =>
      makeValidationError({
        cause: "Array cannot be empty",
        message: `${fieldName} cannot be empty`,
        metadata: { fieldName },
      }),
  );
}

/**
 * Validate that an array has a minimum length.
 *
 * @typeParam T - The array element type.
 * @param value - The array to validate.
 * @param minLength - The minimum length required.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the array or an AppError.
 */
export function validateMinArrayLength<T>(
  value: T[],
  minLength: number,
  fieldName = "Array",
): Result<T[], AppError> {
  return fromPredicate(
    value,
    (arr) => arr.length >= minLength,
    (arr) =>
      makeValidationError({
        cause: "Array must have at least one item",
        message: `${fieldName} must have at least ${minLength} items, got ${arr.length}`,
        metadata: { actualLength: arr.length, fieldName, minLength },
      }),
  );
}

/**
 * Validate that an array has a maximum length.
 *
 * @typeParam T - The array element type.
 * @param value - The array to validate.
 * @param maxLength - The maximum length allowed.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the array or an AppError.
 */
export function validateMaxArrayLength<T>(
  value: T[],
  maxLength: number,
  fieldName = "Array",
): Result<T[], AppError> {
  return fromPredicate(
    value,
    (arr) => arr.length <= maxLength,
    (arr) =>
      makeValidationError({
        cause: "Array must have at most one item",
        message: `${fieldName} must have at most ${maxLength} items, got ${arr.length}`,
        metadata: { actualLength: arr.length, fieldName, maxLength },
      }),
  );
}

/**
 * Validate each element of an array using a validator function.
 *
 * @typeParam T - The input element type.
 * @typeParam U - The output element type after validation.
 * @param value - The array to validate.
 * @param validator - Function to validate each element.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the validated array or the first validation error.
 */
export function validateArrayElements<T, U>(
  value: T[],
  validator: (item: T, index: number) => Result<U, AppError>,
  fieldName = "Array",
): Result<U[], AppError> {
  const results = value.map((item, index) => validator(item, index));
  const collected = collectAll(results);

  if (!collected.ok) {
    return Err(
      makeValidationError({
        cause: "Array contains invalid element(s)",
        message: `${fieldName} contains invalid element`,
        metadata: { fieldName },
      }),
    );
  }

  return { ok: true, value: Array.from(collected.value) } as const;
}

/**
 * Validate that an array contains unique elements.
 *
 * @typeParam T - The array element type.
 * @param value - The array to validate.
 * @param keyFn - Optional function to extract comparison key from each element.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the array or an AppError if duplicates exist.
 */
export function validateUniqueArray<T>(
  value: T[],
  keyFn: (item: T) => unknown = (item) => item,
  fieldName = "Array",
): Result<T[], AppError> {
  return fromPredicate(
    value,
    (arr) => {
      const seen = new Set();
      for (const item of arr) {
        const key = keyFn(item);
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
      }
      return true;
    },
    () =>
      makeValidationError({
        cause: "Array must contain unique elements",
        message: `${fieldName} must contain unique elements`,
        metadata: { fieldName },
      }),
  );
}

/**
 * Validate that an array is actually an array.
 *
 * @param value - The value to check.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the array or an AppError.
 */
export function validateIsArray(
  value: unknown,
  fieldName = "Value",
): Result<unknown[], AppError> {
  if (!Array.isArray(value)) {
    return Err(
      makeValidationError({
        cause: "Value is not an array",
        message: `${fieldName} must be an array`,
        metadata: { actualType: typeof value, fieldName },
      }),
    );
  }
  return { ok: true, value } as const;
}

/**
 * Validate that all elements in an array pass a predicate test.
 *
 * @typeParam T - The array element type.
 * @param value - The array to validate.
 * @param predicate - Function to test each element.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the array or an AppError.
 */
export function validateAllElements<T>(
  value: T[],
  predicate: (item: T, index: number) => boolean,
  fieldName = "Array",
): Result<T[], AppError> {
  return fromPredicate(
    value,
    (arr) => arr.every((item, index) => predicate(item, index)),
    () =>
      makeValidationError({
        cause: "Array contains elements that fail validation",
        message: `${fieldName} contains elements that fail validation`,
        metadata: { fieldName },
      }),
  );
}
