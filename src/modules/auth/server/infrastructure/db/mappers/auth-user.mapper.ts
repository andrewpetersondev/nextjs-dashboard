import "server-only";

import type { AuthUserEntity } from "@/modules/auth/server/application/contracts/auth-user.entity";
import { parseUserRole } from "@/modules/users/domain/role/user.role.parser";
import { toHash } from "@/server/crypto/hashing/hashing.value";
import type { UserRow } from "@/server/db/schema";
import { toUserId } from "@/shared/branding/converters/id-converters";

/**
 * Maps a raw database user row to the AuthUserEntity.
 * Includes sensitive data (password hash) required for authentication.
 */
export function toAuthUserEntity(row: UserRow): AuthUserEntity {
  return {
    email: row.email,
    id: toUserId(row.id),
    password: toHash(row.password),
    role: parseUserRole(row.role),
    sensitiveData: row.sensitiveData ?? "",
    username: row.username,
  };
}

// Remove toNewAuthUserEntity if it's redundant, or keep it as an alias
export const toNewAuthUserEntity = toAuthUserEntity;
