import type { UserEntity } from "@/src/db/entities/user";
import type { UserDTO } from "@/src/dto/user.dto";

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
		id: user.id,
		username: user.username,
		email: user.email,
		role: user.role,
		password: user.password,
		// sensitiveData is intentionally omitted
	};
}
