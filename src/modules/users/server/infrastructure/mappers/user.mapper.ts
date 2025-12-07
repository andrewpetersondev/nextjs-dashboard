import "server-only";
import type { UserDto } from "@/modules/users/domain/dto/user.dto";
import { toUserRole } from "@/modules/users/domain/role.utils";
import type { UserEntity } from "@/modules/users/domain/user.entity";
import type { NewUserRow, UserRow } from "@/server-core/db/schema/users";
import { toUserId } from "@/shared/branding/converters/id-converters";

/**
 * Maps a UserEntity to a UserDto for transport to the client/UI/API.
 * @param entity - The UserEntity object to convert.
 * @returns {UserDto} - The DTO with plain types.
 */
export function userEntityToDto(entity: UserEntity): UserDto {
  return {
    email: String(entity.email),
    id: String(entity.id),
    role: toUserRole(entity.role) as UserDto["role"],
    username: String(entity.username),
  };
}

/**
 * Maps a raw DB row (e.g., from Drizzle) to a UserEntity.
 * Throws if required fields are missing.
 * @param row - The raw DB row.
 * @returns The corresponding UserEntity.
 */
export function userDbRowToEntity(row: UserRow): UserEntity {
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
    id: toUserId(row.id),
    password: row.password,
    role: toUserRole(row.role),
    sensitiveData: row.sensitiveData,
    username: row.username,
  };
}

/**
 * Maps a new DB row to a UserEntity.
 * Throws if required fields are missing.
 * @param row - The new DB row.
 * @returns The corresponding UserEntity.
 */
export function newUserDbRowToEntity(row: NewUserRow): UserEntity {
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
    throw new Error("Missing required new user row fields");
  }

  if (typeof row.id !== "string") {
    throw new Error("User ID must be a string");
  }

  if (typeof row.sensitiveData !== "string") {
    throw new Error("Sensitive data must be a string");
  }

  return {
    email: row.email,
    id: toUserId(row.id),
    password: row.password,
    role: toUserRole(row.role),
    sensitiveData: row.sensitiveData,
    username: row.username,
  };
}
