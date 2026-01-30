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
export const IatSchema = z
  .number()
  .int()
  .nonnegative()
  .refine((v: number) => Number.isSafeInteger(v), {
    message: "iat must be a safe integer",
  });

/**
 * Not Before (nbf) claim schema.
 * Represents a non-negative integer UNIX timestamp (in seconds) before which the token must be considered invalid.
 */
export const NbfSchema = z
  .number()
  .int()
  .nonnegative()
  .refine((v: number) => Number.isSafeInteger(v), {
    message: "nbf must be a safe integer",
  });

/**
 * Expiration (exp) claim schema.
 * Represents a positive integer UNIX timestamp (in seconds) after which the token must be considered invalid.
 */
export const ExpSchema = z
  .number()
  .int()
  .positive()
  .refine((v: number) => Number.isSafeInteger(v), {
    message: "exp must be a safe integer",
  });

/**
 * JWT ID (jti) claim schema.
 * Unique identifier for the token instance (useful for rotation/replay detection).
 */
export const JtiSchema = z.uuid();

/**
 * Session ID (sid) claim schema.
 * Stable identifier for the session (useful for revocation/logout).
 */
export const SidSchema = z.uuid();

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
    jti: JtiSchema,
    nbf: NbfSchema.refine(
      (nbf: number) =>
        nbf <= nowInSeconds() + SESSION_TOKEN_CLOCK_TOLERANCE_SEC,
      {
        message: "nbf must not be in the future (allowing small clock skew)",
      },
    ),
    role: UserRoleEnum,
    sid: SidSchema,
    sub: SubSchema,
  })
  .refine((val) => val.exp > val.iat, {
    message: "exp must be greater than iat",
    path: ["exp"],
  })
  .refine((val) => val.nbf <= val.exp, {
    message: "nbf must be less than or equal to exp",
    path: ["nbf"],
  })
  .refine((val) => val.nbf <= val.iat, {
    message: "nbf must be less than or equal to iat",
    path: ["nbf"],
  });
