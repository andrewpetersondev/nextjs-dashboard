import { type ZodNumber, type ZodUUID, z } from "zod";
import { UserRoleEnumSchema } from "@/shared/policies/user-role/user-role.schema";

/**
 * Issued At (iat) claim schema.
 * Represents a non-negative integer UNIX timestamp (in seconds) indicating when the token was issued.
 */
const IatSchema: ZodNumber = z
	.number()
	.int()
	.nonnegative()
	.refine((v: number) => Number.isSafeInteger(v), {
		message: "iat must be a safe integer",
	});

/**
 * Authentication Time (auth_time) claim schema — OIDC standard.
 * UNIX timestamp (seconds) of the *original* authentication, preserved across rotation.
 *
 * @remarks
 * Optional by design: tokens issued before this claim existed carry no `auth_time`,
 * and rejecting them would log every live session out on deploy. Absence is handled
 * in {@link jwtToSessionTokenClaimsDto}, which falls back to `iat` — the claim then
 * pins itself on that session's next rotation.
 */
const AuthTimeSchema: ZodNumber = z
	.number()
	.int()
	.nonnegative()
	.refine((v: number) => Number.isSafeInteger(v), {
		message: "auth_time must be a safe integer",
	});

/**
 * Not Before (nbf) claim schema.
 * Represents a non-negative integer UNIX timestamp (in seconds) before which the token must be considered invalid.
 */
const NbfSchema: ZodNumber = z
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
const ExpSchema: ZodNumber = z
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
const JtiSchema: ZodUUID = z.uuid();

/**
 * Session ID (sid) claim schema.
 * Stable identifier for the session (useful for revocation/logout).
 */
const SidSchema: ZodUUID = z.uuid();

/**
 * Subject (sub) claim schema.
 * Must be a valid UUID string representing the user identifier.
 */
const SubSchema: ZodUUID = z.uuid();

/**
 * Validates the raw session token payload (e.g., JWT claims) after verification.
 */
export const SessionTokenClaimsSchema = z.object({
	auth_time: AuthTimeSchema.optional(),
	exp: ExpSchema,
	iat: IatSchema,
	jti: JtiSchema,
	nbf: NbfSchema,
	role: UserRoleEnumSchema,
	sid: SidSchema,
	sub: SubSchema,
});
