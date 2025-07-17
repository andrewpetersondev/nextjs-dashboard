import * as z from "zod";
import { roleSchema, type UserRole } from "@/features/users/user.types";

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

/**
 * Result returned when verifying a user session.
 */
export interface SessionVerificationResult {
  isAuthorized: true;
  userId: string;
  role: UserRole;
}

/**
 * Represents a row from the session table in the database.
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
 * Represents a raw row from the session table as returned by Drizzle ORM.
 * This matches the Database schema exactly.
 */
export interface DbSessionRow {
  id: string;
  token: string | null;
  expiresAt: Date;
  userId: string | null;
}

// --- Zod Schemas ---

// --- Zod Field Schemas ---
export const userIdSchema = z.uuid();
export const expiresAtSchema = z.number();
export const iatSchema = z.number();
export const expSchema = z.number();

// --- Zod Validation Schemas ---
export const EncryptPayloadSchema = z.object({
  user: z.object({
    expiresAt: expiresAtSchema,
    role: roleSchema,
    userId: userIdSchema,
  }),
});

export const DecryptPayloadSchema = EncryptPayloadSchema.extend({
  exp: expSchema,
  iat: iatSchema,
});
