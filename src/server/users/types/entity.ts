import "server-only";

import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { PasswordHash } from "@/features/auth/lib/password.types";
import type { UserId } from "@/shared/branding/domain-brands";

/**
 * Domain Type
 * Business logic, invariants, and uses branded types for  domain and service layers.
 */
export interface UserEntity {
  readonly email: string; // Ensure UserId is a UUID string type
  readonly id: UserId;
  readonly password: PasswordHash;
  readonly role: UserRole;
  readonly sensitiveData: string;
  readonly username: string;
}
