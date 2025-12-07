import "server-only";
import type { PasswordHash } from "@/modules/auth/domain/password/password.types";
import type { UserRole } from "@/modules/auth/domain/roles/auth.roles";
import type { UserId } from "@/shared/branding/brands";

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
