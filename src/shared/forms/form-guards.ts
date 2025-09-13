import { ZodError, ZodObject, type ZodRawShape, type ZodTypeAny } from "zod";

export function isZodObject(
  schema: ZodTypeAny,
): schema is ZodObject<ZodRawShape> {
  return schema instanceof ZodObject;
}

export function isZodError(err: unknown): err is ZodError {
  return err instanceof ZodError;
}
