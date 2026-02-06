import "server-only";
import type { AuthUserEntity } from "@/modules/auth/domain/auth-user/entities/auth-user.entity";
import type { UserRow } from "@/server/db/schema";

/**
 * Maps a raw database user row to the {@link AuthUserEntity}.
 *
 * Includes sensitive data (password hash) required for authentication.
 *
 * @param row - The database user row to map.
 * @returns The mapped {@link AuthUserEntity}.
 */
export function toAuthUserEntity(row: UserRow): AuthUserEntity {
  return {
    email: row.email,
    id: row.id,
    password: row.password,
    role: row.role,
    username: row.username,
  };
}
