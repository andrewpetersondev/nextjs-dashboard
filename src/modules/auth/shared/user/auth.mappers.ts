import type { AuthUserTransport } from "@/modules/auth/shared/user/auth.types";
import { parseUserRole } from "@/modules/users/domain/role/user.role.parser";
import { toUserId } from "@/shared/branding/converters/id-converters";

/**
 * Maps database/entity representation to transport-safe AuthUserTransport.
 * Validates and converts all fields to ensure type safety across boundaries.
 */
export const toAuthUserTransport = (src: {
  readonly email: string;
  readonly id: string;
  readonly role: string;
  readonly username: string;
}): AuthUserTransport => {
  // Validate required fields exist
  if (!(src.email && src.id && src.role && src.username)) {
    throw new Error("Invalid user entity: missing required fields");
  }

  return {
    email: src.email,
    id: toUserId(src.id),
    role: parseUserRole(src.role),
    username: src.username,
  };
};
