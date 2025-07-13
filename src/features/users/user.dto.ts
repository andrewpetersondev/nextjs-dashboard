import type { UserRole } from "@/features/users/user.types";

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
 * @example
 * const user: UserDto = {
 *  id: "b1a2c3d4-e5f6-7890-abcd-1234567890ef",
 *  username: "johndoe",
 *  email: "johndoe@mail.com",
 *  role: "user",
 *  };
 *
 * @see UserRole for possible role values.
 *
 */
export interface UserDto {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
}
