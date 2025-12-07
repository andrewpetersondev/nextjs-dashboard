import "server-only";
import type { PasswordHash } from "@/modules/auth/domain/password/password.types";
import type { UserRole } from "@/modules/auth/domain/roles/auth.roles";
import type { UserId } from "@/shared/branding/brands";

/**
 * Domain Type
 * Business logic, invariants, and uses branded types for  domain and service layers.
 */
export interface UserEntity {
  readonly email: string;
  readonly id: UserId;
  readonly password: PasswordHash;
  readonly role: UserRole;
  readonly sensitiveData: string;
  readonly username: string;
}

/**
 * Domain-level parameters required to create a new user.
 * Used by Repository ports to ensure strict typing of domain values (Branded types).
 */
export interface CreateUserProps {
  readonly email: string;
  readonly password: PasswordHash;
  readonly role: UserRole;
  readonly username: string;
}
