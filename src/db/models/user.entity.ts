import type { UserRole } from "@/features/users/user.types";
import type { UserId } from "@/lib/definitions/brands";

/**
 * Represents a user entity in the database, defining the structure and properties of a user record.
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
