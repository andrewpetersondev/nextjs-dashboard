import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/factories/app-error.factory";

/**
 * Validates a condition and throws an error if false.
 * @param condition - The condition to check.
 * @param message - The error message.
 * @throws Error if condition is falsy.
 */
export const validateCondition = (
  condition: unknown,
  message: string,
): void => {
  if (!condition) {
    throw makeAppError(APP_ERROR_KEYS.validation, {
      cause: "",
      message,
      metadata: {},
    });
  }
};

/**
 * Checks if value is a non-negative integer.
 * @param value - The value to check.
 * @returns True if non-negative integer.
 */
export function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/**
 * Checks if value is a non-negative number.
 * @param value - The value to check.
 * @returns True if non-negative number.
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
