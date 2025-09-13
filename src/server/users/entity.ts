import "server-only";
import type { AuthRole } from "@/shared/auth/roles";

import type { UserId } from "@/shared/brands/domain-brands";

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
  readonly role: AuthRole;
  readonly password: string;
  readonly sensitiveData: string;
}
