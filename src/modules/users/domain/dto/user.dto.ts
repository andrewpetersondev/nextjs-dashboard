import type { UserRole } from "@/modules/auth/shared/domain/user/auth.roles";

/**
 * API/UI
 * Used for data transfer with plain types for serialization and transport.
 * Does not contain all properties on purpose.
 */
export interface UserDto {
  readonly email: string;
  readonly id: string;
  readonly role: UserRole;
  readonly username: string;
}
