import "server-only";
import type {
  CreateUserProps,
  UserEntity,
} from "@/modules/users/domain/entities/user.entity";
import { toUserEntity } from "@/modules/users/infrastructure/mappers/to-user-entity.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { type NewUserRow, users } from "@/server/db/schema/users";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { normalizeUnknownError } from "@/shared/errors/factories/app-error.factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Inserts a new user record into the database.
 * @param params - User creation parameters.
 * @returns The created user as UserDto, or null if creation failed.
 * @param db
 */
export async function createUserDal(
  db: AppDatabase,
  params: CreateUserProps,
): Promise<Result<UserEntity | null, AppError>> {
  const { username, email, password, role } = params;

  try {
    // Explicitly type the insert object as NewUserRow (schema type)
    // This ensures we match the shape required by Drizzle's $inferInsert
    const newUser: NewUserRow = {
      email,
      password,
      role,
      username,
    };

    const [userRow] = await db.insert(users).values(newUser).returning();
    return Ok(userRow ? toUserEntity(userRow) : null);
  } catch (error) {
    logger.error("Failed to create a user in the database.", {
      context: "createUserDal",
      email,
      error,
      role,
      username,
    });
    return Err(normalizeUnknownError(error, APP_ERROR_KEYS.database));
  }
}
