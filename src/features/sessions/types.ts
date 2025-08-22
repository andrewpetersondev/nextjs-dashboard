import "server-only";

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
