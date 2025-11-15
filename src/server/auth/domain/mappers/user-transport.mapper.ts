import "server-only";
import { toUserRole } from "@/features/users/lib/to-user-role";
import type { AuthUserTransport } from "@/server/auth/domain/types/user-transport.types";
import { toUserId } from "@/shared/branding/id-converters";

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
    role: toUserRole(src.role),
    username: src.username,
  };
};
