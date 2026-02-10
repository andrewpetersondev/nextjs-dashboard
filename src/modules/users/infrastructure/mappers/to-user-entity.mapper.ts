import "server-only";
import type { UserEntity } from "@/modules/users/domain/entities/user.entity";
import type { UserRow } from "@/server/db/schema/users";

/**
 * Maps a raw DB row (e.g., from Drizzle) to a UserEntity.
 * Throws if required fields are missing.
 * @param row - The raw DB row.
 * @returns The corresponding UserEntity.
 */
export function toUserEntity(row: UserRow): UserEntity {
  if (
    !(
      row.id &&
      row.email &&
      row.password &&
      row.role &&
      row.sensitiveData &&
      row.username
    )
  ) {
    throw new Error("Missing required user row fields");
  }
  return {
    email: row.email,
    id: row.id,
    password: row.password,
    role: row.role,
    sensitiveData: row.sensitiveData,
    username: row.username,
  };
}
