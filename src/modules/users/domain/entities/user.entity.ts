import "server-only";

import type { Hash, UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/validation/user/user-role.schema";

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

export type UpdateUserProps = {
  email?: string;
  password?: Hash;
  role?: UserRole;
  username?: string;
};
