import "server-only";

import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { PasswordHash } from "@/features/auth/lib/password.types";
import type { UserDto } from "@/features/users/lib/dto";
import type { AppDatabase } from "@/server/db/db.connection";
import { users } from "@/server/db/schema/users";
import {
  userDbRowToEntity,
  userEntityToDto,
} from "@/server/users/mapping/user.mappers";
import { DatabaseError } from "@/shared/errors/base-error.subclasses";
import { logger } from "@/shared/logging/logger.shared";

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
): Promise<UserDto | null> {
  try {
    const [userRow] = await db
      .insert(users)
      .values({ email, password, role, username })
      .returning();
    // --- Map raw DB row to UserEntity before mapping to DTO ---
    const user = userRow ? userDbRowToEntity(userRow) : null;
    return user ? userEntityToDto(user) : null;
  } catch (error) {
    logger.error("Failed to create a user in the database.", {
      context: "createUserDal",
      email,
      error,
      role,
      username,
    });
    throw new DatabaseError(
      "Failed to create a user in the database.",
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
