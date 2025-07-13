import type { UserEntity } from "@/db/models/user.entity";
import type { UserDto } from "@/features/users/user.dto";
import { toUserId, toUserRoleBrand } from "@/lib/definitions/brands";

/**
 * Constants for default values.
 */
const DEFAULT_SENSITIVE_DATA = "cantTouchThis";

/**
 * Maps a UserDto (from API or client) to a UserEntity (DB model).
 * Fills in required fields with safe defaults if missing.
 * @param dto - The UserDto object.
 * @returns The corresponding UserEntity.
 */
export function toUserEntity(dto: UserDto): UserEntity {
  // Defensive: never allow undefined for required fields
  if (!(dto.id && dto.username && dto.email && dto.role)) {
    throw new Error("Invalid UserDto: missing required fields");
  }
  return {
    email: dto.email,
    id: toUserId(dto.id),
    password: "",
    role: toUserRoleBrand(dto.role),
    sensitiveData: DEFAULT_SENSITIVE_DATA, // Never map password from DTO; must be set explicitly
    username: dto.username, // Use constant for default
  };
}

/**
 * Maps a UserEntity (DB model) to a UserDto (safe for API/client).
 * Excludes sensitive fields.
 * @param entity - The UserEntity object.
 * @returns The corresponding UserDto.
 */
export function toUserDto(entity: UserEntity): UserDto {
  return {
    email: entity.email,
    id: entity.id,
    role: entity.role,
    username: entity.username,
    // Never expose password or sensitiveData
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

// export function _dbRowToUserEntityVersion2(
//   row: Record<string, unknown>,
// ): UserEntity {
//   // Defensive: validate and brand fields
//   if (
//     typeof row.id !== "string" ||
//     typeof row.username !== "string" ||
//     typeof row.email !== "string" ||
//     typeof row.role !== "string"
//   ) {
//     throw new Error("Invalid DB row: missing or invalid user fields");
//   }
//   return toUserEntity({
//     email: row.email,
//     id: toUserId(row.id),
//     password: row.password,
//     role: toUserRoleBrand(row.role),
//     sensitiveData: row.sensitiveData,
//     username: row.username,
//   });
// }
