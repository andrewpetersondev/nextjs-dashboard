import "server-only";

import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import type { Hash } from "@/server/crypto/hashing/hashing.types";
import type { UserId } from "@/shared/branding/brands";

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
  readonly sensitiveData: string;
  readonly username: string;
}
