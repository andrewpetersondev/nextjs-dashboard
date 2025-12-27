import { z } from "zod";
import type { UserId } from "@/shared/branding/brands";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { userRoleSchema } from "@/shared/domain/user/user-role.schema";

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

// Codec: string <-> branded UserId
export const userIdCodec = z.codec(
  z.uuid(), // input: UUID string
  z.custom<UserId>(), // output: branded UserId
  {
    decode: (id) => toUserId(id),
    encode: (userId) => String(userId),
  },
);

// Accept either UUID string or UserId in inputs; always produce UserId
export const userIdSchema = z
  .union([z.string().uuid(), userIdCodec])
  .transform<UserId>((val) => (typeof val === "string" ? toUserId(val) : val));

export const expiresAtSchema = z.number().int().positive();
export const sessionStartSchema = z.number().int().nonnegative();

export const EncryptPayloadSchema = z
  .object({
    user: z.object({
      expiresAt: expiresAtSchema,
      role: userRoleSchema,
      sessionStart: sessionStartSchema,
      userId: userIdSchema, // => UserId post-parse
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
