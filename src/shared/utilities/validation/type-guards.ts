import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeValidationError } from "@/shared/errors/factories/app-error.factory";
import type { Result } from "@/shared/result/result.types";
import { fromGuard, fromPredicate } from "@/shared/result/sync/result-sync";

/**
 * Validate that a value is a string.
 *
 * @param value - The value to check.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the string or an AppError.
 */
export function validateIsString(
  value: unknown,
  fieldName = "Value",
): Result<string, AppError> {
  return fromGuard(
    value,
    (v): v is string => typeof v === "string",
    () =>
      makeValidationError({
        cause: "",
        message: `${fieldName} must be a string`,
        metadata: { actualType: typeof value, fieldName },
      }),
  );
}

/**
 * Validate that a value is a number.
 *
 * @param value - The value to check.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the number or an AppError.
 */
export function validateIsNumber(
  value: unknown,
  fieldName = "Value",
): Result<number, AppError> {
  return fromGuard(
    value,
    (v): v is number => typeof v === "number" && !Number.isNaN(v),
    () =>
      makeValidationError({
        cause: "",
        message: `${fieldName} must be a number`,
        metadata: { actualType: typeof value, fieldName },
      }),
  );
}

/**
 * Validate that a value is a boolean.
 *
 * @param value - The value to check.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the boolean or an AppError.
 */
export function validateIsBoolean(
  value: unknown,
  fieldName = "Value",
): Result<boolean, AppError> {
  return fromGuard(
    value,
    (v): v is boolean => typeof v === "boolean",
    () =>
      makeValidationError({
        cause: "",
        message: `${fieldName} must be a boolean`,
        metadata: { actualType: typeof value, fieldName },
      }),
  );
}

/**
 * Validate that a value is an object (not null, not array).
 *
 * @param value - The value to check.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the object or an AppError.
 */
export function validateIsObject(
  value: unknown,
  fieldName = "Value",
): Result<Record<string, unknown>, AppError> {
  return fromGuard(
    value,
    (v): v is Record<string, unknown> =>
      typeof v === "object" && v !== null && !Array.isArray(v),
    () =>
      makeValidationError({
        cause: "",
        message: `${fieldName} must be an object`,
        metadata: {
          actualType: typeof value,
          fieldName,
          isArray: Array.isArray(value),
          isNull: value === null,
        },
      }),
  );
}

/**
 * Validate that a value is a function.
 *
 * @param value - The value to check.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the function or an AppError.
 */
export function validateIsFunction(
  value: unknown,
  fieldName = "Value",
): Result<(...args: unknown[]) => unknown, AppError> {
  return fromGuard(
    value,
    (v): v is (...args: unknown[]) => unknown => typeof v === "function",
    () =>
      makeValidationError({
        cause: "",
        message: `${fieldName} must be a function`,
        metadata: { actualType: typeof value, fieldName },
      }),
  );
}

/**
 * Validate that a value is a Date instance.
 *
 * @param value - The value to check.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the Date or an AppError.
 */
export function validateIsDate(
  value: unknown,
  fieldName = "Value",
): Result<Date, AppError> {
  return fromGuard(
    value,
    (v): v is Date => v instanceof Date && !Number.isNaN(v.getTime()),
    () =>
      makeValidationError({
        cause: "",
        message: `${fieldName} must be a valid Date`,
        metadata: {
          actualType: typeof value,
          fieldName,
          isDate: value instanceof Date,
        },
      }),
  );
}

/**
 * Validate that a value is null.
 *
 * @param value - The value to check.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing null or an AppError.
 */
export function validateIsNull(
  value: unknown,
  fieldName = "Value",
): Result<null, AppError> {
  return fromGuard(
    value,
    (v): v is null => v === null,
    () =>
      makeValidationError({
        cause: "",
        message: `${fieldName} must be null`,
        metadata: { actualType: typeof value, fieldName },
      }),
  );
}

/**
 * Validate that a value is undefined.
 *
 * @param value - The value to check.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing undefined or an AppError.
 */
export function validateIsUndefined(
  value: unknown,
  fieldName = "Value",
): Result<undefined, AppError> {
  return fromGuard(
    value,
    (v): v is undefined => v === undefined,
    () =>
      makeValidationError({
        cause: "",
        message: `${fieldName} must be undefined`,
        metadata: { actualType: typeof value, fieldName },
      }),
  );
}

/**
 * Validate that a value is defined (not null or undefined).
 *
 * @typeParam T - The value type.
 * @param value - The value to check.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the non-nullable value or an AppError.
 */
export function validateIsDefined<T>(
  value: T | null | undefined,
  fieldName = "Value",
): Result<T, AppError> {
  return fromPredicate(
    value as T,
    (v): v is T => v !== null && v !== undefined,
    () =>
      makeValidationError({
        cause: "",
        message: `${fieldName} must be defined`,
        metadata: {
          fieldName,
          isNull: value === null,
          isUndefined: value === undefined,
        },
      }),
  );
}

/**
 * Create a type guard validator for a specific instance type.
 *
 * @typeParam T - The expected instance type.
 * @param ctor - The constructor function to check against.
 * @param fieldName - Optional field name for error message.
 * @returns A validator function that checks instanceof.
 */
export function validateInstanceOf<T>(
  ctor: new (...args: unknown[]) => T,
  fieldName = "Value",
): (value: unknown) => Result<T, AppError> {
  return (value: unknown) =>
    fromGuard(
      value,
      (v): v is T => v instanceof ctor,
      () =>
        makeValidationError({
          cause: "",
          message: `${fieldName} must be an instance of ${ctor.name}`,
          metadata: {
            actualType: typeof value,
            expectedType: ctor.name,
            fieldName,
          },
        }),
    );
}
