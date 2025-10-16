import "server-only";

import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { UserId } from "@/shared/domain/domain-brands";

/**
 * Domain Type
 * Business logic, invariants, and uses branded types for  domain and service layers.
 */
export interface UserEntity {
  readonly id: UserId; // Ensure UserId is a UUID string type
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
  readonly password: string; // TODO: auth folder uses a hashed password, update schema and this
  readonly sensitiveData: string;
}
