import { makeAppError } from "@/shared/errors/factories/app-error.factory";

/**
 * Validates the given condition and throws a ValidationError with the specified message if the condition is falsy.
 *
 * @param condition - The condition to evaluate; typically a boolean or truthy/falsy value.
 * @param message - The error message to include if the validation fails.
 * @example
 * validateCondition(user.name, "Name is required"); // Throws if user.name is falsy.
 */
export const validateCondition = (
  condition: unknown,
  message: string,
): void => {
  if (!condition) {
    throw makeAppError("validation", { message });
  }
};

export function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
