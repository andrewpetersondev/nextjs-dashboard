import "server-only";

import type { Hash, UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.schema";

/**
 * Domain entity used within the Auth module.
 * Represents a user with credentials needed for authentication.
 *
 * @remarks This is a specialized view of `UserEntity` for the Auth domain.
 */
export interface AuthUserEntity {
  /** User's email address */
  readonly email: string;
  /** Unique user identifier (branded) */
  readonly id: UserId;
  /** Hashed password for verification (branded) */
  readonly password: Hash;
  /** User's system role */
  readonly role: UserRole;
  /** Unique username */
  readonly username: string;
}
