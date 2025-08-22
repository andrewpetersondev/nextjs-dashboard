import "server-only";

import * as z from "zod";
import { roleSchema } from "@/features/users/user.schema";

export const userIdSchema = z.uuid();
export const expiresAtSchema = z.number();
export const iatSchema = z.number();
export const expSchema = z.number();

export const EncryptPayloadSchema = z.object({
  user: z.object({
    expiresAt: expiresAtSchema,
    role: roleSchema,
    userId: userIdSchema,
  }),
});

export const DecryptPayloadSchema = EncryptPayloadSchema.extend({
  exp: expSchema,
  iat: iatSchema,
});
