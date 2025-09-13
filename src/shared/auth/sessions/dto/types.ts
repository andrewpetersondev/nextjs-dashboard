import type { AuthRole } from "@/shared/auth/domain/roles";

/**
 * Payload for encrypting a session (JWT or similar).
 */
export interface EncryptPayload {
  user: {
    userId: string;
    role: AuthRole;
    expiresAt: number; // Unix timestamp (ms)
    sessionStart: number; // Unix timestamp (ms) - immutable session start
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
