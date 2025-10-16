import "server-only";

import { z } from "zod";
import { roleSchema } from "@/features/users/lib/user.schema";

/**
 * Issued At (iat) claim schema.
 * Represents a non-negative integer UNIX timestamp (in seconds) indicating when the token was issued.
 */
export const iatSchema = z.number().int().nonnegative();

/**
 * Expiration (exp) claim schema.
 * Represents a positive integer UNIX timestamp (in seconds) after which the token must be considered invalid.
 */
export const expSchema = z.number().int().positive();

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
/**
 * DecryptPayloadSchema
 *
 * Extends the base EncryptPayloadSchema with standard JWT-like claims:
 * - exp: token expiration time
 * - iat: token issued-at time
 *
 * Use this schema to validate payloads after decryption, ensuring temporal claims are present and well-typed.
 */
export const DecryptPayloadSchema = EncryptPayloadSchema.safeExtend({
  exp: expSchema,
  iat: iatSchema,
});
