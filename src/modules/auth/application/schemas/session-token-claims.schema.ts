import { z } from "zod";
import { SESSION_TOKEN_CLOCK_TOLERANCE_SEC } from "@/modules/auth/application/constants/session-token.constants";
import type { UserId } from "@/shared/branding/brands";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { nowInSeconds } from "@/shared/constants/time.constants";
import { UserRoleEnum } from "@/shared/domain/user/user-role.schema";

/**
 * Issued At (iat) claim schema.
 * Represents a non-negative integer UNIX timestamp (in seconds) indicating when the token was issued.
 */
export const IatSchema = z.number().int().nonnegative();

/**
 * Expiration (exp) claim schema.
 * Represents a positive integer UNIX timestamp (in seconds) after which the token must be considered invalid.
 */
export const ExpSchema = z.number().int().positive();

/**
 * Subject (sub) claim schema.
 * Must be a valid UUID string representing the user identifier.
 */
export const SubSchema = z.uuid();

/**
 * UserId boundary schema (UUID string ⇄ branded UserId).
 */
export const UserIdSchema = z.codec(z.uuid(), z.custom<UserId>(), {
  decode: (id: string) => toUserId(id),
  encode: (userId: UserId) => String(userId),
});

/**
 * Validates the raw session token payload (e.g., JWT claims) after verification.
 */
export const SessionTokenClaimsSchema = z
  .object({
    exp: ExpSchema,
    iat: IatSchema.refine(
      (iat: number) =>
        iat <= nowInSeconds() + SESSION_TOKEN_CLOCK_TOLERANCE_SEC,
      {
        message: "iat must not be in the future (allowing small clock skew)",
      },
    ),
    role: UserRoleEnum,
    sub: SubSchema,
  })
  .refine((val) => val.exp > val.iat, {
    message: "exp must be greater than iat",
    path: ["exp"],
  });
