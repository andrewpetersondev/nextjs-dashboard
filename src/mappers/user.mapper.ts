import type { UserEntity } from "@/src/db/entities/user";
import type { UserDTO } from "@/src/dto/user.dto";

export function toUserDTO(user: UserEntity): UserDTO {
	return {
		id: user.id,
		username: user.username,
		email: user.email,
		role: user.role,
		password: user.password,
	};
}
