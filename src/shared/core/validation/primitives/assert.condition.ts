import { ValidationError } from "@/shared/core/errors/domain/domain-errors";

/**
 * Validates the given condition and throws a ValidationError with the specified message if the condition is falsy.
 *
 * @param condition - The condition to evaluate; typically a boolean or truthy/falsy value.
 * @param message - The error message to include if the validation fails.
 * @throws {ValidationError} If the provided condition is falsy.
 * @example
 * validateCondition(user.name, "Name is required"); // Throws if user.name is falsy.
 */
export const validateCondition = (
  condition: unknown,
  message: string,
): void => {
  if (!condition) {
    throw new ValidationError(message);
  }
};
