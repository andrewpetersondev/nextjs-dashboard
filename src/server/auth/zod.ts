import "server-only";

import { type ZodNumber, type ZodObject, z } from "zod";
import { EncryptPayloadSchema } from "@/shared/auth/sessions/zod";

export const iatSchema: ZodNumber = z.number();
export const expSchema: ZodNumber = z.number();

export const DecryptPayloadSchema: ZodObject = EncryptPayloadSchema.extend({
  exp: expSchema,
  iat: iatSchema,
});
