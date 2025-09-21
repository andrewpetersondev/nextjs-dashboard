/**
 * @file Narrowing helpers around Zod types and errors to keep schema-helpers clean.
 */
import { ZodError, ZodObject, type ZodRawShape, type ZodTypeAny } from "zod";

/** Type guard that checks whether a given Zod type is a ZodObject. */
export function isZodObject(
  schema: ZodTypeAny,
): schema is ZodObject<ZodRawShape> {
  return schema instanceof ZodObject;
}

/** Type guard for ZodError instances. */
export function isZodError(err: unknown): err is ZodError {
  return err instanceof ZodError;
}
