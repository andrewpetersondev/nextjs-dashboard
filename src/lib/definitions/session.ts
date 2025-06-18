import { type UserRole, roleSchema } from "@/src/lib/definitions/enums";
import { z as zod } from "@/src/lib/definitions/zod-alias";

// --- Session payload types ---
export type EncryptPayload = {
	user: {
		userId: string;
		role: UserRole;
		expiresAt: number;
	};
};

export type DecryptPayload = EncryptPayload & {
	iat: number;
	exp: number;
};

// --- Zod Field Schemas ---
export const userIdSchema = zod.string().uuid();
export const expiresAtSchema = zod.number();
export const iatSchema = zod.number();
export const expSchema = zod.number();

// --- Validation Schemas ---
export const EncryptPayloadSchema = zod.object({
	user: zod.object({
		userId: userIdSchema,
		role: roleSchema,
		expiresAt: expiresAtSchema,
	}),
});

export const DecryptPayloadSchema = EncryptPayloadSchema.extend({
	iat: iatSchema,
	exp: expSchema,
});

/**
 * The shape of the result returned when verifying a user session.
 */
export interface SessionVerificationResult {
	isAuthorized: true;
	userId: string;
	role: UserRole;
}
