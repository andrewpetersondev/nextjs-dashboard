import { type ZodRawShape, z } from "zod";

/**
 * Determines whether a Zod schema is a {@link z.ZodObject}.
 *
 * @param schema - Any Zod schema instance.
 * @returns True if the schema is an object schema; otherwise false.
 */
export const isZodObjectSchema = (
  schema: z.ZodType,
): schema is z.ZodObject<ZodRawShape> => schema instanceof z.ZodObject;

/**
 * Type guard that checks whether the provided value is an actual {@link z.ZodError}.
 *
 * @param err - The value to test.
 * @returns `true` if `err` is an instance of {@link z.ZodError}; otherwise `false`.
 */
export const isZodErrorInstance = (err: unknown): err is z.ZodError =>
  err instanceof z.ZodError;

/**
 * Loose shape check for a value resembling a {@link z.ZodError}.
 *
 * This performs a non-strict (duck-typed) check to see if the value is a non-null
 * object that exposes ZodError-like properties (`name`, `issues`, or `flatten`).
 *
 * @param err - The value to test.
 * @returns `true` if `err` looks like a ZodError (has `name`, `issues`, or `flatten`); otherwise `false`.
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
