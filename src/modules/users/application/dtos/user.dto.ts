import type { UserRole } from "@/shared/validation/user/user-role.constants";

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
