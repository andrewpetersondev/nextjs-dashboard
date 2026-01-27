import type { AuthenticatedUserDto } from "@/modules/auth/application/dtos/authenticated-user.dto";
import type { AuthUserEntity } from "@/modules/auth/domain/entities/auth-user.entity";
import { toUserId } from "@/shared/branding/converters/id-converters";
import { parseUserRole } from "@/shared/domain/user/user-role.parser";

/**
 * Maps a persisted authentication user entity to its safe output DTO representation.
 *
 * This function centralizes the transformation logic to ensure consistency
 * across use cases and to ensure that sensitive data is not leaked.
 *
 * @param user - The user entity from the domain layer.
 * @returns A safe DTO for use in application and presentation layers.
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
