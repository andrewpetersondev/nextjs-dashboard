import { z as zod } from "zod";

// --- Types ---

/**
 * Payload for encrypting a session.
 */
export type EncryptPayload = {
	user: {
		userId: string;
		role: UserSessionRole;
		expiresAt: number;
	};
};

/**
 * Allowed user roles for session.
 */
export type UserSessionRole = "admin" | "user" | "guest";

/**
 * Payload for decrypting a session, includes JWT claims.
 */
export type DecryptPayload = EncryptPayload & {
	iat: number;
	exp: number;
};

// --- Validation Schemas ---

/**
 * Zod schema for encrypt payload validation.
 */
export const EncryptPayloadSchema = zod.object({
	user: zod.object({
		userId: zod.string().uuid(),
		role: zod.enum(["admin", "user"]),
		expiresAt: zod.number(),
	}),
});

/**
 * Zod schema for decrypt payload validation (extends encrypt payload).
 */
export const DecryptPayloadSchema = EncryptPayloadSchema.extend({
	iat: zod.number(),
	exp: zod.number(),
});

/*
import { z } from "zod";

export const EncryptPayloadSchema = z.object({
	user: z.object({
		userId: z.string().uuid(),
		role: z.enum(["admin", "user"]),
		expiresAt: z.number(),
	}),
});

export type EncryptPayload = {
	user: {
		userId: string;
		role: string;
		expiresAt: number;
	};
};

export const DecryptPayloadSchema = EncryptPayloadSchema.extend({
	iat: z.number(),
	exp: z.number(),
});

export type DecryptPayload = z.infer<typeof DecryptPayloadSchema>;
*/
