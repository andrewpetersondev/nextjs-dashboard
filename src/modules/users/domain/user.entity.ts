import "server-only";
import type { UserRole } from "@/modules/auth/domain/user/auth.roles";
import type { Hash } from "@/server/crypto/hashing/hashing.types";
import type { UserId } from "@/shared/branding/brands";

/**
 * Domain Type
 * Business logic, invariants, and uses branded types for  domain and service layers.
 */
export interface UserEntity {
  readonly email: string;
  readonly id: UserId;
  readonly password: Hash;
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
  readonly password: Hash;
  readonly role: UserRole;
  readonly username: string;
}
