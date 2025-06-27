import { roleSchema, type UserRole } from "@/src/lib/definitions/enums.ts";
import { z as zod } from "@/src/lib/definitions/zod-alias.ts";

/**
 * Payload for encrypting a session (JWT or similar).
 */
export interface EncryptPayload {
	user: {
		userId: string;
		role: UserRole;
		expiresAt: number; // Unix timestamp (ms)
	};
}

/**
 * Payload after decrypting a session (includes JWT claims).
 */
export interface DecryptPayload extends EncryptPayload {
	iat: number; // Issued at (Unix timestamp)
	exp: number; // Expiration (Unix timestamp)
}

// --- Zod Field Schemas ---
export const userIdSchema = zod.string().uuid();
export const expiresAtSchema = zod.number();
export const iatSchema = zod.number();
export const expSchema = zod.number();

// --- Validation Schemas ---
export const EncryptPayloadSchema = zod.object({
	user: zod.object({
		expiresAt: expiresAtSchema,
		role: roleSchema,
		userId: userIdSchema,
	}),
});

export const DecryptPayloadSchema = EncryptPayloadSchema.extend({
	exp: expSchema,
	iat: iatSchema,
});

/**
 * Result returned when verifying a user session.
 */
export interface SessionVerificationResult {
	isAuthorized: true;
	userId: string;
	role: UserRole;
}

/**
 * Represents a row from the sessions table in the database.
 * This type is aligned with the Drizzle ORM schema.
 */
export interface SessionRecord {
	/** Unique session identifier (UUID) */
	id: string;
	/** Opaque session token (random, unique) */
	token: string;
	/** Session expiration timestamp (ISO 8601 string) */
	expiresAt: string;
	/** Associated user ID (UUID) */
	userId: string;
}

/**
 * Represents a raw row from the sessions table as returned by Drizzle ORM.
 * This matches the DB schema exactly.
 */
export interface DbSessionRow {
	id: string;
	token: string | null;
	expiresAt: Date;
	userId: string | null;
}
