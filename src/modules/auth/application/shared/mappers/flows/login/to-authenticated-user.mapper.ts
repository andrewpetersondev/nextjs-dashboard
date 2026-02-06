import type { AuthenticatedUserDto } from "@/modules/auth/application/auth-user/dtos/responses/authenticated-user.dto";
import type { AuthUserEntity } from "@/modules/auth/domain/auth-user/entities/auth-user.entity";

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
    id: user.id,
    role: user.role,
    username: user.username,
  };
}
