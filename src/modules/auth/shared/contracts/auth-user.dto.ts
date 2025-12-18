import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";
import type { UserId } from "@/shared/branding/brands";

/**
 * Lightweight transport shape for authenticated user responses.
 */
export interface AuthUserDto {
  readonly email: string;
  readonly id: UserId;
  readonly role: UserRole;
  readonly username: string;
}
