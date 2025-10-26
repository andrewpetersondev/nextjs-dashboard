import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { PasswordHash } from "@/features/auth/lib/password.types";

/**
 * Unified signup payload used across Service → Repo → DAL boundaries.
 * Keeps strong types (PasswordHash, UserRole).
 */
export interface AuthSignupPayload {
  readonly email: string;
  readonly password: PasswordHash;
  readonly role: UserRole;
  readonly username: string;
}
