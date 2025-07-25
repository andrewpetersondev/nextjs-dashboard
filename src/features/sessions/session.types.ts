import * as z from "zod";
import { roleSchema } from "@/features/users/user.schema";
import type { UserRole } from "@/features/users/user.types";

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
