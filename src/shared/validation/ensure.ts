import { ValidationError } from "@/shared/errors/domain";

/**
 * Asserts that a condition holds true, otherwise throws a ValidationError.
 *
 * @param condition - Any truthy/falsy value to assert.
 * @param message - Message included in the thrown ValidationError when the assertion fails.
 * @throws {ValidationError} When the provided condition is falsy.
 */
export const ensure = (condition: unknown, message: string): void => {
  if (!condition) {
    throw new ValidationError(message);
  }
};
