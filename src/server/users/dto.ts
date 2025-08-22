import "server-only";

import type { UserRole } from "@/features/users/types";

/**
 * Data Transfer Object (DTO) representing a user entity.
 *
 * - Uses only plain types (string, number, etc.) for safe serialization.
 * - Intended for API/UI transport; never expose branded or internal types.
 * - Do not include sensitive or internal-only fields.
 *
 * @remarks
 * - Used for transferring user data between layers (API, services, etc.).
 * - All properties are immutable and strictly typed.
 *
 * @property id - Unique identifier for the user (UUID string).
 * @property username - Username of the user.
 * @property email - Email address of the user.
 * @property role - Role of the user (e.g., "admin", "user").
 *
 */
export interface UserDto {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
}
