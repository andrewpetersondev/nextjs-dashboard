import type { Hash, UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.schema";

/**
 * Domain entity used within the Auth module.
 * Represents a user with credentials needed for authentication.
 *
 * @remarks This is a specialized view of `UserEntity` for the Auth domain.
 */
export interface AuthUserEntity {
  /** User's primary email address used for identification and login. */
  readonly email: string;
  /** Unique user identifier (branded UserId). */
  readonly id: UserId;
  /** Hashed password (branded Hash) for secure credential verification. */
  readonly password: Hash;
  /** System-level role (e.g., 'admin', 'user') for access control. */
  readonly role: UserRole;
  /** Unique username chosen by the user. */
  readonly username: string;
}
