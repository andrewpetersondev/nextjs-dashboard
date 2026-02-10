import { type ZodNumber, type ZodUUID, z } from "zod";
import { UserRoleEnum } from "@/shared/validation/user/user-role.schema";

/**
 * Issued At (iat) claim schema.
 * Represents a non-negative integer UNIX timestamp (in seconds) indicating when the token was issued.
 */
export const IatSchema: ZodNumber = z
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
export const NbfSchema: ZodNumber = z
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
export const ExpSchema: ZodNumber = z
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
export const JtiSchema: ZodUUID = z.uuid();

/**
 * Session ID (sid) claim schema.
 * Stable identifier for the session (useful for revocation/logout).
 */
export const SidSchema: ZodUUID = z.uuid();

/**
 * Subject (sub) claim schema.
 * Must be a valid UUID string representing the user identifier.
 */
export const SubSchema: ZodUUID = z.uuid();

/**
 * Validates the raw session token payload (e.g., JWT claims) after verification.
 */
// biome-ignore lint/nursery/useExplicitType: fix
export const SessionTokenClaimsSchema = z.object({
  exp: ExpSchema,
  iat: IatSchema,
  jti: JtiSchema,
  nbf: NbfSchema,
  role: UserRoleEnum,
  sid: SidSchema,
  sub: SubSchema,
});
