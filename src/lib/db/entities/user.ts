import type { UserId, UserRole } from "@/lib/definitions/users.types";

/**
 * Represents a user entity in the database, defining the structure and properties of a user record.
 *
 * - **Purpose: **
 *   Provides a strongly typed contract for user entities, mapping directly to the columns in the user's table.
 *
 * - **Fields: **
 *   - `id`: Unique identifier for the user
 *   - `username`: User's display name
 *   - `email`: User's email address
 *   - `role`: User's role and permissions level
 *   - `password`: Hashed password string
 *   - `sensitiveData`: Protected user information
 *
 * - **Usage: **
 *   Used in database operations, authentication flows, and user management features
 *   to ensure type safety and data consistency.
 *
 * - **Best Practices: **
 *   - All fields are readonly to prevent accidental mutations
 *   - Sensitive data should be handled with appropriate security measures
 */
export interface UserEntity {
  readonly id: UserId; // Ensure UserId is a UUID string type
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
  readonly password: string;
  readonly sensitiveData: string;
}

// maybe implement in the future
// type UserDto = Pick<UserEntity, "id" | "username" | "email" | "role">;

// maybe implement in the future
// export function toUserDto(user: UserEntity): UserDto {
//     return Object.freeze({
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//     });
// }
