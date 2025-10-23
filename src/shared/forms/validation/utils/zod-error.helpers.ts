import { type ZodRawShape, z } from "zod";
// ZodRawShape is a type used in Zod (v4) to describe the shape of an object schema. It represents an object where
// each key is a string and each value is a Zod type. For example, when you create a schema with z.object({ ... }),
// the object you pass in is a ZodRawShape. It is used internally for typing the structure of Zod object schemas.

/**
 * Flatten a ZodError into an object with keys: formErrors, fieldErrors
 *
 *
 *
 * @example
 * // Create invalid data (username is valid, email is invalid, password is invalid)
 * const invalidUser = {
 *     username: "andrew",
 *     email: "invalid-email",
 *     password: "123",
 * //  asdf: "this key will cause a form error when using flatten and something similar when using treeify"
 * };
 *
 * {
 *   formErrors: [],
 *   fieldErrors: {
 *     email: [ 'Email had some sort of error. Please try again.' ],
 *     password: [
 *       'Password must be at least 5 characters long.',
 *       'Password must contain at least one letter.',
 *       'Password must contain at least one special character.'
 *     ]
 *   }
 * }
 *
 * @returns formErrors: string[], fieldErrors: Record<string, string[]>
 *
 * @remarks
 * - formErrors is always present as an empty array if no form errors exist
 * - fieldErrors is an object with keys: field name and value is an array of error messages
 *      - If no errors exist for a field, the key does not exist
 *
 */
export const flattenZodError = (error: z.ZodError) => {
  const flattened = z.flattenError(error);
  return flattened;
};

/**
 * Determine whether a given Zod schema is a {@link z.ZodObject}.
 *
 * @param schema - Any Zod schema instance.
 * @returns True if the schema is an object schema; otherwise, false.
 *
 * @example
 * ```ts
 * if (isZodObject(schema)) {
 *   // schema is narrowed to z.ZodObject<ZodRawShape>
 *   const keys = Object.keys(schema.shape);
 * }
 * ```
 */
export const isZodObjectSchema = (
  schema: z.ZodType,
): schema is z.ZodObject<ZodRawShape> => schema instanceof z.ZodObject;

/**
 * Type guard: checks whether the provided value is a real {@link z.ZodError}.
 *
 * @param err - The value to test.
 * @returns `true` if `err` is an instance of {@link z.ZodError}; otherwise `false`.
 *
 * @remarks
 * - Use this when you know the error comes from Zod parsing within your own codebase.
 * - Narrowing with this guard gives you full type safety and access to the `ZodError` API.
 */
export const isZodErrorInstance = (err: unknown): err is z.ZodError =>
  err instanceof z.ZodError;

/**
 * Type guard: loosely checks whether the provided value has a shape similar to {@link z.ZodError}.
 *
 * @param err - The value to test.
 * @returns `true` if `err` is a non-null object with ZodError-like properties
 * (`issues` or `flatten`); otherwise `false`.
 *
 * @remarks
 * - Use this at system boundaries (e.g., logging, API layers) where the error may have been
 *   serialized, come from a different runtime, or otherwise not be a real `ZodError` instance.
 * - This guard performs a "duck typing" check: it only verifies that the object has
 *   recognizable ZodError properties, not that it is an actual `ZodError`.
 */
export const isZodErrorLikeShape = (
  err: unknown,
): err is {
  name?: string;
  issues?: unknown[];
  flatten?: () => {
    fieldErrors: Record<string, readonly string[] | undefined>;
  };
} => {
  if (typeof err !== "object" || err === null) {
    return false;
  }

  const anyErr = err as {
    name?: unknown;
    issues?: unknown;
    flatten?: unknown;
  };

  const nameLooksRight =
    typeof anyErr.name === "string" && anyErr.name === "ZodError";

  const issuesLooksRight = Array.isArray(anyErr.issues);

  const flattenLooksRight = typeof anyErr.flatten === "function";

  return nameLooksRight || issuesLooksRight || flattenLooksRight;
};

// -------------------
// unused
// ---------------------

export const untouchedZodError = (error: z.ZodError) => error;

export const treeifyZodError = (error: z.ZodError) => {
  const tree = z.treeifyError(error);
  return tree;
};
