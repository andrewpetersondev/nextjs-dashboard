import "server-only";

import { type ZodNumber, type ZodObject, z } from "zod";
import { EncryptPayloadSchema } from "@/shared/auth/sessions/dto/zod";

export const iatSchema: ZodNumber = z.number().int().nonnegative();
export const expSchema: ZodNumber = z.number().int().positive();

export const DecryptPayloadSchema: ZodObject = EncryptPayloadSchema.safeExtend({
  exp: expSchema,
  iat: iatSchema,
});
