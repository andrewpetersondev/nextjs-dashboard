import "server-only";
import type { PasswordHash } from "@/modules/auth/domain/password/password.types";
import type { UserRole } from "@/modules/auth/domain/roles/auth.roles";
import type { UserEntity } from "@/modules/users/domain/entity";
import { userDbRowToEntity } from "@/modules/users/server/infrastructure/mappers/user.mapper";
import type { AppDatabase } from "@/server-core/db/db.connection";
import { users } from "@/server-core/db/schema/users";
import { AppError } from "@/shared/errors/core/app-error.class";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Inserts a new user record into the database.
 * @param params - User creation parameters.
 * @returns The created user as UserDto, or null if creation failed.
 * @param db
 */
export async function createUserDal(
  db: AppDatabase,
  {
    username,
    email,
    password,
    role,
  }: {
    username: string;
    email: string;
    password: PasswordHash;
    role: UserRole;
  },
): Promise<UserEntity | null> {
  try {
    const [userRow] = await db
      .insert(users)
      .values({ email, password, role, username })
      .returning();
    // --- Map raw DB row to UserEntity ---
    return userRow ? userDbRowToEntity(userRow) : null;
  } catch (error) {
    logger.error("Failed to create a user in the database.", {
      context: "createUserDal",
      email,
      error,
      role,
      username,
    });
    throw new AppError("database", {
      message: "Failed to create a user in the database.",
    });
  }
}
