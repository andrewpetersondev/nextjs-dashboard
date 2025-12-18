import type { AppError } from "@/shared/errors/core/app-error";
import { makeValidationError } from "@/shared/errors/factories/app-error.factory";
import type { Result } from "@/shared/result/result.types";
import { fromPredicate } from "@/shared/result/sync/result-sync";

const ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate that a string is non-empty.
 *
 * @param value - The string to validate.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the non-empty string or an AppError.
 */
export function validateNonEmpty(
  value: string,
  fieldName = "String",
): Result<string, AppError> {
  return fromPredicate(
    value,
    (s) => s.length > 0,
    () =>
      makeValidationError({
        message: `${fieldName} cannot be empty`,
        metadata: { fieldName },
      }),
  );
}

/**
 * Validate that a string has a minimum length.
 *
 * @param value - The string to validate.
 * @param minLength - The minimum length required.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the string or an AppError.
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName = "String",
): Result<string, AppError> {
  return fromPredicate(
    value,
    (s) => s.length >= minLength,
    (s) =>
      makeValidationError({
        message: `${fieldName} must be at least ${minLength} characters, got ${s.length}`,
        metadata: { actualLength: s.length, fieldName, minLength },
      }),
  );
}

/**
 * Validate that a string has a maximum length.
 *
 * @param value - The string to validate.
 * @param maxLength - The maximum length allowed.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the string or an AppError.
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName = "String",
): Result<string, AppError> {
  return fromPredicate(
    value,
    (s) => s.length <= maxLength,
    (s) =>
      makeValidationError({
        message: `${fieldName} must be at most ${maxLength} characters, got ${s.length}`,
        metadata: { actualLength: s.length, fieldName, maxLength },
      }),
  );
}

/**
 * Validate that a string matches a regex pattern.
 *
 * @param value - The string to validate.
 * @param pattern - The regex pattern to match.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the string or an AppError.
 */
export function validatePattern(
  value: string,
  pattern: RegExp,
  fieldName = "String",
): Result<string, AppError> {
  return fromPredicate(
    value,
    (s) => pattern.test(s),
    () =>
      makeValidationError({
        message: `${fieldName} does not match required pattern`,
        metadata: { fieldName, pattern: pattern.source },
      }),
  );
}

/**
 * Validate that a string is a valid email address.
 *
 * @param value - The string to validate.
 * @returns A Result containing the email string or an AppError.
 */
export function validateEmail(value: string): Result<string, AppError> {
  return fromPredicate(
    value,
    (s) => EMAIL_PATTERN.test(s),
    () =>
      makeValidationError({
        message: "Invalid email address format",
        metadata: { value },
      }),
  );
}

/**
 * Validate that a string contains only alphanumeric characters.
 *
 * @param value - The string to validate.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the string or an AppError.
 */
export function validateAlphanumeric(
  value: string,
  fieldName = "String",
): Result<string, AppError> {
  return validatePattern(value, ALPHANUMERIC_PATTERN, fieldName);
}

/**
 * Trim whitespace from a string and validate it's non-empty.
 *
 * @param value - The string to trim and validate.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the trimmed string or an AppError.
 */
export function validateTrimmed(
  value: string,
  fieldName = "String",
): Result<string, AppError> {
  const trimmed = value.trim();
  return fromPredicate(
    trimmed,
    (s) => s.length > 0,
    () =>
      makeValidationError({
        message: `${fieldName} cannot be empty or whitespace only`,
        metadata: { fieldName },
      }),
  );
}

/**
 * Validate that a string is one of the allowed values.
 *
 * @typeParam T - The string literal type.
 * @param value - The string to validate.
 * @param allowedValues - Array of allowed values.
 * @param fieldName - Optional field name for error message.
 * @returns A Result containing the validated string or an AppError.
 */
export function validateOneOf<T extends string>(
  value: string,
  allowedValues: readonly T[],
  fieldName = "String",
): Result<T, AppError> {
  return fromPredicate(
    value as T,
    (v) => allowedValues.includes(v),
    () =>
      makeValidationError({
        message: `${fieldName} must be one of: ${allowedValues.join(", ")}`,
        metadata: { allowedValues, fieldName, value },
      }),
  );
}

/**
 * Validate that a string is a valid URL.
 *
 * @param value - The string to validate.
 * @returns A Result containing the URL string or an AppError.
 */
export function validateUrl(value: string): Result<string, AppError> {
  return fromPredicate(
    value,
    (s) => {
      try {
        new URL(s);
        return true;
      } catch {
        return false;
      }
    },
    () =>
      makeValidationError({
        message: "Invalid URL format",
        metadata: { value },
      }),
  );
}
