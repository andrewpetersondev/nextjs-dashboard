import "server-only";

import type { Database } from "@/server/db/connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { createUserDal } from "@/server/users/dal/create";
import { createRandomPassword } from "@/shared/auth/domain/password";
import type { AuthRole } from "@/shared/auth/domain/roles";

import type { UserDto } from "@/shared/users/dto";

/**
 * Creates a demo user with a unique username and email for the given role.
 * Uses a random password and returns the created user as UserDto.
 * @param db - The database instance (Drizzle)
 * @param id - Unique counter for the demo user
 * @param role - The branded UserRole
 * @returns The created demo user as UserDto, or null if creation failed
 */
export async function createDemoUser(
  db: Database,
  id: number,
  role: AuthRole,
): Promise<UserDto | null> {
  try {
    // Generate a secure random password for the demo user
    const demoPassword = createRandomPassword();

    // Construct unique email and username for the demo user
    const uniqueEmail = `demo+${role}${id}@demo.com`;
    const uniqueUsername = `Demo_${role.toUpperCase()}_${id}`;

    // Create the user in the database using the DAL
    return await createUserDal(db, {
      email: uniqueEmail,
      password: demoPassword,
      role,
      username: uniqueUsername,
    });
  } catch (error) {
    serverLogger.error({
      context: "createDemoUser",
      error,
      id,
      message: "Failed to create a demo user.",
      role,
    });
    return null; // Return null on failure for safe downstream handling
  }
}
