import "server-only";

import { toUserRole } from "@/features/users/lib/to-user-role";
import { hashPassword } from "@/server/auth/hashing";
import type { Database } from "@/server/db/connection";
import { users } from "@/server/db/schema";
import { DatabaseError } from "@/server/errors/infrastructure";
import { serverLogger } from "@/server/logging/serverLogger";
import { userDbRowToEntity, userEntityToDto } from "@/server/users/mapper";
import type { AuthRole } from "@/shared/auth/roles";
import type { UserDto } from "@/shared/users/dto";

/**
 * Inserts a new user record into the database.
 * @param params - User creation parameters.
 * @returns The created user as UserDto, or null if creation failed.
 * @param db
 */
export async function createUserDal(
  db: Database,
  {
    username,
    email,
    password,
    role = toUserRole("user"),
  }: {
    username: string;
    email: string;
    password: string;
    role?: AuthRole;
  },
): Promise<UserDto | null> {
  try {
    const hashedPassword = await hashPassword(password);
    const [userRow] = await db
      .insert(users)
      .values({ email, password: hashedPassword, role, username })
      .returning();
    // --- Map raw DB row to UserEntity before mapping to DTO ---
    const user = userRow ? userDbRowToEntity(userRow) : null;
    return user ? userEntityToDto(user) : null;
  } catch (error) {
    serverLogger.error({
      context: "createUserDal",
      email,
      error,
      message: "Failed to create a user in the database.",
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
