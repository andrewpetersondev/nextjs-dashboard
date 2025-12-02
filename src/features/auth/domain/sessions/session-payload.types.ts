import type { UserRole } from "@/features/auth/domain/auth.roles";

/**
 * Result returned when verifying a user session.
 */
export interface SessionVerificationResult {
  isAuthorized: true;
  userId: string;
  role: UserRole;
}
