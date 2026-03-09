import type { UserRow } from "@database/schema";
import type { AuthUserEntity } from "@/modules/auth/domain/auth-user/entities/auth-user.entity";
import { toUserId } from "@/modules/users/domain/user-id.mappers";
import { toHash } from "@/server/crypto/hashing/hashing.value";

/**
 * Map a persisted user row to the auth user entity.
 *
 * @param row - The persisted user row.
 * @returns The auth user entity with branded values restored.
 */
export function toAuthUserEntity(row: UserRow): AuthUserEntity {
	return {
		email: row.email,
		id: toUserId(row.id),
		password: toHash(row.password),
		role: row.role,
		username: row.username,
	};
}
