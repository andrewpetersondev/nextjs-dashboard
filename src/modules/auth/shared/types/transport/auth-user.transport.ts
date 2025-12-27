import type { UserId } from "@/shared/branding/brands";
import type { UserRole } from "@/shared/domain/user/user-role.types";

/**
 * A safe, flattened version of the user for use across the wire (cookies/HTTP).
 * No sensitive data like password hashes.
 */
export interface AuthUserTransport {
  readonly email: string;
  readonly id: UserId;
  readonly role: UserRole;
  readonly username: string;
}
