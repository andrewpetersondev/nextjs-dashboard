import "server-only";

import { toUserRole } from "@/features/users/lib/to-user-role";
import type { UserRow } from "@/server/db/schema";
import type { UserDto } from "@/server/users/dto";
import type { UserEntity } from "@/server/users/entity";
import { toUserId } from "@/shared/brands/domain-brands";

/**
 * Maps a UserEntity to a UserDto for transport to the client/UI/API.
 *
 * - Strips branded types to plain type for serialization.
 * - Use this function when sending user data to external consumers.
 * - Defensively converts all properties to plain types.
 *
 * @param entity - The UserEntity object to convert.
 * @returns {UserDto} - The DTO with plain types.
 *
 * @example
 * const dto = toUserDto(user);
 *
 */
export function userEntityToDto(entity: UserEntity): UserDto {
  return {
    email: String(entity.email),
    id: String(entity.id),
    role: toUserRole(entity.role) as UserDto["role"], // Ensure role is branded correctly
    username: String(entity.username),
  };
}

/**
 * Maps a raw DB row (e.g., from Drizzle) to a UserEntity.
 * Use this if you fetch raw rows and need to enforce types.
 * @param row - The raw DB row.
 * @returns The corresponding UserEntity.
 */
export function userDbRowToEntity(row: UserRow): UserEntity {
  return {
    email: row.email,
    id: toUserId(row.id),
    password: row.password,
    role: toUserRole(row.role),
    sensitiveData: row.sensitiveData,
    username: row.username,
  };
}
