/**
 * @file Narrowing helpers around Zod types and errors to keep schema utilities clean.
 *
 * @remarks
 * These type guards centralize Zod-specific instanceof checks to improve readability
 * and enable precise type narrowing when working with schemas and validation errors.
 */
import { ZodError, ZodObject, type ZodRawShape, type ZodTypeAny } from "zod";

/**
 * Determine whether a given Zod schema is a {@link ZodObject}.
 *
 * @param schema - Any Zod schema instance.
 * @returns True if the schema is an object schema; otherwise, false.
 *
 * @example
 * ```ts
 * if (isZodObject(schema)) {
 *   // schema is narrowed to ZodObject<ZodRawShape>
 *   const keys = Object.keys(schema.shape);
 * }
 * ```
 */
export function isZodObject(
  schema: ZodTypeAny,
): schema is ZodObject<ZodRawShape> {
  return schema instanceof ZodObject;
}

/**
 * Determine whether a value is a {@link ZodError}.
 *
 * @param err - Unknown value to test.
 * @returns True if the value is a ZodError; otherwise, false.
 *
 * @example
 * ```ts
 * try {
 *   schema.parse(input);
 * } catch (e) {
 *   if (isZodError(e)) {
 *     // Access Zod-specific error formatting
 *     const issues = e.issues;
 *   }
 * }
 * ```
 */
export function isZodError(err: unknown): err is ZodError {
  return err instanceof ZodError;
}
