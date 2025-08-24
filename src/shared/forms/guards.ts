import { z } from "zod";

export function isZodObject(
  schema: z.ZodTypeAny,
): schema is z.ZodObject<z.ZodRawShape> {
  return schema instanceof z.ZodObject;
}
