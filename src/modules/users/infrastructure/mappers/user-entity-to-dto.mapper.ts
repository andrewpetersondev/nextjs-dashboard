import type { UserDto } from "@/modules/users/application/dtos/user.dto";
import type { UserEntity } from "@/modules/users/domain/entities/user.entity";

/**
 * Maps a UserEntity to a UserDto for transport to the client/UI/API.
 * @param entity - The UserEntity object to convert.
 * @returns {UserDto} - The DTO with plain types.
 */
export function userEntityToDto(entity: UserEntity): UserDto {
  return {
    email: String(entity.email),
    id: String(entity.id),
    role: entity.role,
    username: String(entity.username),
  };
}
