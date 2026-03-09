import type { UserRow } from "@database/schema";
import type { UserEntity } from "@/modules/users/domain/entities/user.entity";
import { toUserId } from "@/modules/users/domain/user-id.mappers";
import { toHash } from "@/server/crypto/hashing/hashing.value";

/**
 * Map a database user row to a domain user entity.
 *
 * @param row - The database row to convert.
 * @returns The domain user entity with branded identifiers and hash.
 */
export function toUserEntity(row: UserRow): UserEntity {
	return {
		email: row.email,
		id: toUserId(row.id),
		password: toHash(row.password),
		role: row.role,
		sensitiveData: row.sensitiveData,
		username: row.username,
	};
}
