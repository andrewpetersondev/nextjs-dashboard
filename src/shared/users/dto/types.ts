import type { AuthRole } from "@/shared/auth/domain/roles";

/**
 * Data Transfer Object (DTO) representing a user entity for client/server transport.
 *
 * - Plain, serializable types only
 * - Safe for UI consumption
 */
export interface UserDto {
  readonly email: string;
  readonly id: string;
  readonly role: AuthRole;
  readonly username: string;
}
