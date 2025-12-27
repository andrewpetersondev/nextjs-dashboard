import "server-only";

import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import type { Hash } from "@/server/crypto/hashing/hashing.value";

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
