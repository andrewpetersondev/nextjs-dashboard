import "server-only";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { PasswordHash } from "@/features/auth/lib/password.types";
import type { UserId } from "@/shared/domain/domain-brands";

/**
 * Remember that this is a copy of UserEntity
 */
export interface AuthUserEntity {
  readonly email: string;
  readonly id: UserId;
  readonly password: PasswordHash;
  readonly role: UserRole;
  readonly sensitiveData: string;
  readonly username: string;
}
