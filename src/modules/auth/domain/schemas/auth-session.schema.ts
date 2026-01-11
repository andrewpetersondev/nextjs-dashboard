import { z } from "zod";
import type { UserId } from "@/shared/branding/brands";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { nowInSeconds } from "@/shared/constants/time.constants";

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

/**
 * Subject (sub) claim schema.
 * Must be a valid UUID string representing the user identifier.
 */
export const subSchema = z.string().uuid();

/**
 * Role claim schema (infrastructure layer).
 * Validated as string at JWT layer, typed as UserRole at application layer.
 */
export const roleClaimSchema = z.string().min(1);

// Codec: string <-> branded UserId
export const userIdCodec = z.codec(
  z.uuid(), // input: UUID string
  z.custom<UserId>(), // output: branded UserId
  {
    decode: (id) => toUserId(id),
    encode: (userId) => String(userId),
  },
);

/**
 * DecryptPayloadSchema - JWT claims validation
 *
 * Validates the raw JWT payload after decryption/verification.
 * Contains JWT-standard claims (sub, iat, exp) plus role for performance.
 */
export const DecryptPayloadSchema = z
  .object({
    exp: expSchema,
    iat: iatSchema.refine((val) => val <= nowInSeconds() + 5, {
      message: "iat must not be in the future (allowing small clock skew)",
    }),
    role: roleClaimSchema,
    sub: subSchema,
  })
  .refine((val) => val.exp > val.iat, {
    message: "exp must be greater than iat",
    path: ["exp"],
  });

// todo: why does EncryptPayloadSchema not exist?
