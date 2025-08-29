import type { AuthRole } from "@/shared/auth/roles";

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

export const SignupAllowedFields = ["username", "email", "password"] as const;
export const LoginAllowedFields = ["email", "password"] as const;
