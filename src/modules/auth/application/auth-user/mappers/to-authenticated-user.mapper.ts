import type { AuthenticatedUserDto } from "@/modules/auth/application/auth-user/dtos/authenticated-user.dto";
import type { AuthUserEntity } from "@/modules/auth/domain/auth-user/entities/auth-user.entity";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { parseUserRole } from "@/shared/domain/user/user-role.parser";

/**
 * Maps a persisted authentication user entity to a safe authenticated-user DTO.
 *
 * @remarks
 * This is a pure mapper (no business rules). It also ensures that sensitive
 * properties (like password hashes) never leave the Auth domain boundary.
 */
export function toAuthenticatedUserDto(
  user: AuthUserEntity,
): AuthenticatedUserDto {
  return {
    email: user.email,
    id: toUserId(user.id),
    role: parseUserRole(user.role),
    username: user.username,
  };
}
