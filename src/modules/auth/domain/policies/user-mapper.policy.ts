import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import type { AuthUserEntity } from "@/modules/auth/domain/entities/auth-user.entity";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { parseUserRole } from "@/shared/domain/user/user-role.parser";

/**
 * Maps a persisted AuthUser entity to its output DTO representation.
 * Centralizes transformation logic to ensure consistency across use-cases.
 */
export function toAuthUserOutputDto(
  user: AuthUserEntity,
): AuthenticatedUserDto {
  return {
    email: user.email,
    id: toUserId(user.id),
    role: parseUserRole(user.role),
    username: user.username,
  };
}
