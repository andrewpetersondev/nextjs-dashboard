import type { AuthUserOutputDto } from "@/modules/auth/application/dtos/auth-user.output.dto";
import type { AuthUserEntity } from "@/modules/auth/domain/entities/auth-user.entity";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { parseUserRole } from "@/shared/domain/user/user-role.parser";

/**
 * Maps a persisted AuthUser entity to its output DTO representation.
 * Centralizes transformation logic to ensure consistency across use-cases.
 */
export function toAuthUserOutputDto(user: AuthUserEntity): AuthUserOutputDto {
  return {
    email: user.email,
    id: toUserId(user.id),
    role: parseUserRole(user.role),
    username: user.username,
  };
}
