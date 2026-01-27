import "server-only";

import type { Hash, UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.schema";

/**
 * Domain entity used within the Auth module.
 * Includes the password hash needed for verification.
 *
 * @remarks Remember that this is a copy of UserEntity
 */
export interface AuthUserEntity {
  readonly email: string;
  readonly id: UserId;
  readonly password: Hash;
  readonly role: UserRole;
  readonly username: string;
}
