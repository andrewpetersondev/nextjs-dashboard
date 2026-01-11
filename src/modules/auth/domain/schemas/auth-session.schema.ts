import { z } from "zod";
import type { UserId } from "@/shared/branding/brands";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { MILLISECONDS_PER_SECOND } from "@/shared/constants/time.constants";
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
// todo: should the encode/decode be swapped? right now decoding takes a plain string and produces a branded UserId
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

export const sessionStartSchema = z
  .number()
  .int()
  .nonnegative()
  .refine((val) => val <= Math.floor(Date.now() / MILLISECONDS_PER_SECOND), {
    message: "sessionStart must not be in the future",
  });

export const EncryptPayloadBase = z.object({
  expiresAt: expiresAtSchema,
  role: userRoleSchema,
  sessionStart: sessionStartSchema,
  userId: userIdSchema,
});

export const EncryptPayloadSchema = EncryptPayloadBase.refine(
  (val) => val.sessionStart <= val.expiresAt,
  {
    message: "sessionStart must be less than or equal to expiresAt",
    path: ["sessionStart"],
  },
);

/**
 * DecryptPayloadSchema
 *
 * Extends the base EncryptPayloadSchema with standard JWT-like claims:
 * - exp: token expiration time
 * - iat: token issued-at time
 *
 * Use this schema to validate payloads after decryption, ensuring temporal claims are present and well-typed.
 */
export const DecryptPayloadSchema = EncryptPayloadBase.extend({
  exp: expSchema,
  iat: iatSchema.refine((val) => val <= Date.now() + 5000, {
    message: "iat must not be in the future (allowing small clock skew)",
  }),
}).refine((val) => val.sessionStart <= val.expiresAt, {
  message: "sessionStart must be less than or equal to expiresAt",
  path: ["sessionStart"],
});
