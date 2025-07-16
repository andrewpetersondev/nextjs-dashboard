import "server-only";

/**
 * Validates that an object has all required fields with expected types.
 * Throws an error if any field is missing or of the wrong type.
 *
 * @template T - The expected object type.
 * @param obj - The object to validate.
 * @param schema - An object mapping field names to expected types (e.g., "string", "number").
 * @param context - Optional context for error messages.
 * @throws {Error} If a required field is missing or has the wrong type.
 */
export const validateRequiredFields = <T extends object>(
  obj: unknown,
  schema: Record<
    keyof T,
    "string" | "number" | "boolean" | "object" | "undefined" | "function"
  >,
  context = "object",
): asserts obj is T => {
  if (typeof obj !== "object" || obj === null) {
    throw new Error(`Invalid ${context}: not an object`);
  }
  for (const [key, type] of Object.entries(schema)) {
    // @ts-expect-error: dynamic property access
    if (typeof obj[key] !== type) {
      throw new Error(
        `Invalid ${context}: missing or invalid field "${key}" (expected ${type})`,
      );
    }
  }
};
