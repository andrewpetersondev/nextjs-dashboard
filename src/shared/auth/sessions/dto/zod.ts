import { z } from "zod";
import { roleSchema } from "@/shared/users/schema.shared";

export const userIdSchema = z.uuid();
export const expiresAtSchema = z.number().int().positive();
export const sessionStartSchema = z.number().int().nonnegative();

export const EncryptPayloadSchema = z
  .object({
    user: z.object({
      expiresAt: expiresAtSchema,
      role: roleSchema,
      sessionStart: sessionStartSchema,
      userId: userIdSchema,
    }),
  })
  .refine((val) => val.user.sessionStart <= val.user.expiresAt, {
    message: "sessionStart must be less than or equal to expiresAt",
    path: ["user", "sessionStart"],
  });
