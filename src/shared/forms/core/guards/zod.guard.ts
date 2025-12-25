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
 * This performs a duck-typed check to see if the value is a non-null
 * object that exposes standard ZodError properties (`name` and `issues`).
 *
 * @param err - The value to test.
 * @returns `true` if `err` looks like a ZodError; otherwise `false`.
 */
export const isZodErrorLikeShape = (
  err: unknown,
): err is {
  name: string;
  issues: { path: (string | number | symbol)[]; message: string }[];
} => {
  if (
    typeof err !== "object" ||
    err === null ||
    !("name" in err) ||
    err.name !== "ZodError" ||
    !("issues" in err) ||
    !Array.isArray(err.issues)
  ) {
    return false;
  }

  return err.issues.every(
    (issue) =>
      typeof issue === "object" &&
      issue !== null &&
      "path" in issue &&
      Array.isArray(issue.path) &&
      "message" in issue &&
      typeof issue.message === "string",
  );
};
