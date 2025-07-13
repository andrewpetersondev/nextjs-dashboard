import type { UserEntity } from "@/db/models/user.entity";
import type { UserRawDrizzle } from "@/db/schema";
import type { UserDto } from "@/features/users/user.dto";
import { toUserId, toUserRoleBrand } from "@/lib/definitions/brands";

/**
 * Transforms a raw database row (from Drizzle ORM) into a strongly-typed `UserEntity`.
 *
 * - Enforces domain invariants and applies defensive branding.
 * - Validates primitive types at runtime; branding is compile-time only.
 * - Throws if required fields are missing or invalid.
 *
 * @param row - Raw user row from the database (may be branded by Drizzle).
 * @returns {UserEntity} - The domain entity with enforced invariants and branding.
 * @throws {Error} - If required fields are missing or invalid.
 *
 * @example
 * const entity = toUserEntity(dbRow);
 *
 */
export function toUserEntity(row: UserRawDrizzle): UserEntity {
  // Defensive: Validate all required fields
  if (
    !row ||
    typeof row.email !== "string" ||
    typeof row.id !== "string" ||
    typeof row.password !== "string" ||
    typeof row.role !== "string" ||
    typeof row.sensitiveData !== "string" ||
    typeof row.username !== "string"
  ) {
    throw new Error("Invalid user row: missing required fields");
  }
  // Defensive: Apply branding even though the properties are already branded in the DB schema
  return {
    email: row.email,
    id: toUserId(row.id),
    password: row.password,
    role: toUserRoleBrand(row.role),
    sensitiveData: row.sensitiveData,
    username: row.username,
  };
}

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
export function toUserDto(entity: UserEntity): UserDto {
  return {
    email: String(entity.email),
    id: String(entity.id),
    role: toUserRoleBrand(entity.role) as UserDto["role"], // Ensure role is branded correctly
    username: String(entity.username),
  };
}

/**
 * Maps a raw DB row (e.g., from Drizzle) to a UserEntity.
 * Use this if you fetch raw rows and need to enforce types.
 * @param row - The raw DB row.
 * @returns The corresponding UserEntity.
 */
export function dbRowToUserEntity(row: Record<string, unknown>): UserEntity {
  // Defensive: validate and brand fields
  if (
    typeof row.id !== "string" ||
    typeof row.username !== "string" ||
    typeof row.email !== "string" ||
    typeof row.role !== "string" ||
    typeof row.password !== "string" ||
    typeof row.sensitiveData !== "string"
  ) {
    throw new Error("Invalid DB row: missing or invalid user fields");
  }
  return {
    email: row.email,
    id: toUserId(row.id),
    password: row.password,
    role: toUserRoleBrand(row.role),
    sensitiveData: row.sensitiveData,
    username: row.username,
  };
}
