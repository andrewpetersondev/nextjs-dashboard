import "server-only";

import type { Hash } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * Unified signup payload used across Service → Repo → DAL boundaries.
 * Keeps strong types (Hash, UserRole).
 */
export interface AuthSignupPayload {
  readonly email: string;
  readonly password: Hash;
  readonly role: UserRole;
  readonly username: string;
}
