import { z } from "zod";
import type { AuthRole } from "@/shared/auth/types";
import { roleSchema } from "@/shared/users/schema.shared";

export const userIdSchema = z.uuid();
export const expiresAtSchema = z.number();

export const EncryptPayloadSchema = z.object({
  user: z.object({
    expiresAt: expiresAtSchema,
    role: roleSchema,
    userId: userIdSchema,
  }),
});

/**
 * Payload for encrypting a session (JWT or similar).
 */
export interface EncryptPayload {
  user: {
    userId: string;
    role: AuthRole;
    expiresAt: number; // Unix timestamp (ms)
  };
}

/**
 * Result returned when verifying a user session.
 */
export interface SessionVerificationResult {
  isAuthorized: true;
  userId: string;
  role: AuthRole;
}
