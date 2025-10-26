import { type ZodRawShape, z } from "zod";

/**
 * Determine whether a given Zod schema is a {@link z.ZodObject}.
 *
 * @param schema - Any Zod schema instance.
 * @returns True if the schema is an object schema; otherwise, false.
 */
export const isZodObjectSchema = (
  schema: z.ZodType,
): schema is z.ZodObject<ZodRawShape> => schema instanceof z.ZodObject;

/**
 * Type guard: checks whether the provided value is a real {@link z.ZodError}.
 *
 * @param err - The value to test.
 * @returns `true` if `err` is an instance of {@link z.ZodError}; otherwise `false`.
 */
export const isZodErrorInstance = (err: unknown): err is z.ZodError =>
  err instanceof z.ZodError;

/**
 * Type guard: loosely checks whether the provided value has a shape similar to {@link z.ZodError}.
 *
 * @param err - The value to test.
 * @returns `true` if `err` is a non-null object with ZodError-like properties; otherwise `false`.
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
