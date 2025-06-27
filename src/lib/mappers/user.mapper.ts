import type { UserEntity } from "@/src/lib/db/entities/user.ts";
import type { UserDTO } from "@/src/lib/dto/user.dto.ts";

/**
 * Converts a UserEntity to a UserDTO.
 * This mapper function is used to transform the database entity
 * into a format suitable for the frontend, ensuring sensitive data
 * is not exposed.
 *
 * @param user - The UserEntity instance to convert.
 * @returns A UserDTO instance with safe fields.
 */
export function toUserDTO(user: UserEntity): UserDTO {
	return {
		email: user.email,
		id: user.id,
		role: user.role,
		username: user.username,
	};
}
