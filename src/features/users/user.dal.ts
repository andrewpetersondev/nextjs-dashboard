/**
 * User Data Access Layer (DAL) for CRUD operations on User entities.
 * Uses Drizzle ORM for database access.
 */
import "server-only";

import { asc, count, eq, ilike, or } from "drizzle-orm";
import type { Database } from "@/db/connection";
import { demoUserCounters, users } from "@/db/schema";
import { DatabaseError } from "@/errors/errors";
import {
  comparePassword,
  hashPassword,
} from "@/features/sessions/session.utils";
import type { UserDto } from "@/features/users/user.dto";
import { dbRowToUserEntity, toUserDto } from "@/features/users/user.mapper";
import type { UserRole, UserUpdatePatch } from "@/features/users/user.types";
import { ITEMS_PER_PAGE_USERS } from "@/lib/constants/ui.constants";
import { toUserRole, type UserId } from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";
import { createRandomPassword } from "@/lib/utils/password";

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
    role?: UserRole;
  },
): Promise<UserDto | null> {
  try {
    const hashedPassword = await hashPassword(password);
    const [userRow] = await db
      .insert(users)
      .values({ email, password: hashedPassword, role, username })
      .returning();
    // --- Map raw DB row to UserEntity before mapping to DTO ---
    const user = userRow ? dbRowToUserEntity(userRow) : null;
    return user ? toUserDto(user) : null;
  } catch (error) {
    logger.error({
      context: "createUserDal",
      email,
      error,
      message: "Failed to create a user in the database.",
      role,
      username,
    });
    throw new DatabaseError("Failed to create a user in the database.", error);
  }
}

/**
 * Retrieves a user from the database by branded UserId.
 * Maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - The database instance.
 * @param id - The user's branded UserId.
 * @returns The user as UserDto, or null if not found.
 */
export async function readUserDal(
  db: Database,
  id: UserId, // Use branded UserId for strict typing
): Promise<UserDto | null> {
  try {
    // Fetch raw DB row, not UserEntity
    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!userRow) {
      return null;
    }

    // Map raw DB row to UserEntity for type safety (brands id/role)
    const userEntity = dbRowToUserEntity(userRow);

    // Map to DTO for safe return to client
    return toUserDto(userEntity);
  } catch (error) {
    logger.error({
      context: "readUserDal",
      error,
      id,
      message: "Failed to read user by ID.",
    });
    throw new DatabaseError("Failed to read user by ID.", error);
  }
}

/**
 * Updates a user in the database with the provided patch.
 * Always maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - The database instance.
 * @param id - The user's branded UserId.
 * @param patch - An object containing the fields to update.
 * @returns The updated user as UserDto, or null if no changes or update failed.
 */
export async function updateUserDal(
  db: Database,
  id: UserId,
  patch: UserUpdatePatch,
): Promise<UserDto | null> {
  // Defensive: No update if patch is empty
  if (Object.keys(patch).length === 0) {
    return null;
  }
  try {
    // Always fetch raw DB row, then map to UserEntity for type safety
    const [userRow] = await db
      .update(users)
      .set(patch)
      .where(eq(users.id, id))
      .returning();

    if (!userRow) {
      return null;
    }

    // Map raw DB row to UserEntity (brands id/role)
    const userEntity = dbRowToUserEntity(userRow);

    // Map to DTO for safe return to client
    return toUserDto(userEntity);
  } catch (error) {
    logger.error({
      context: "updateUserDal",
      error,
      id,
      message: "Failed to update user.",
      patch,
    });
    throw new DatabaseError("Failed to update user.", error);
  }
}

/**
 * Deletes a user by branded UserId.
 * Maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - Database instance (Drizzle)
 * @param userId - UserId (branded)
 * @returns UserDto if deleted, otherwise null
 */
export async function deleteUserDal(
  db: Database,
  userId: UserId, // Use branded UserId for strict typing
): Promise<UserDto | null> {
  try {
    // Fetch raw DB row, not UserEntity
    const [deletedRow] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!deletedRow) {
      return null;
    }

    // Map raw DB row to UserEntity for type safety
    const deletedEntity = dbRowToUserEntity(deletedRow);

    // Map to DTO for safe return to client
    return toUserDto(deletedEntity);
  } catch (error) {
    logger.error({
      context: "deleteUserDal",
      error,
      message: "Failed to delete user.",
      userId,
    });
    throw new DatabaseError(
      "An unexpected error occurred. Please try again.",
      error,
    );
  }
}

/**
 * Finds a user by email and verifies the password.
 * Maps raw DB row to UserEntity, then to UserDto.
 * @param db - Database instance (Drizzle)
 * @param email - User's email address
 * @param password - Plaintext password to verify
 * @returns UserDto if credentials are valid, otherwise null
 */
export async function findUserForLogin(
  db: Database,
  email: string,
  password: string,
): Promise<UserDto | null> {
  if (!(email && password)) {
    return null;
  }

  try {
    // Always fetch raw row, then map to UserEntity for type safety
    const [userRow] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!userRow) {
      return null;
    }

    // Map raw DB row to UserEntity (brands id/role)
    const userEntity = dbRowToUserEntity(userRow);

    // Securely compare password
    const validPassword = await comparePassword(password, userEntity.password);
    if (!validPassword) {
      return null;
    }

    // Map to DTO for safe return
    return toUserDto(userEntity);
  } catch (error) {
    logger.error({
      context: "findUserForLogin",
      email,
      error,
      message: "Failed to find user for login.",
    });
    throw new DatabaseError("Failed to read user by email.", error);
  }
}

/**
 * Fetches a user by their branded UserId.
 * Maps the raw DB row to UserEntity, then to UserDto for safe return.
 * @param db - Database instance (Drizzle)
 * @param id - UserId (branded)
 * @returns UserDto if found, otherwise null
 */
export async function fetchUserById(
  db: Database,
  id: UserId, // Use branded UserId for strict typing
): Promise<UserDto | null> {
  try {
    // Fetch raw DB row, not UserEntity
    const [userRow] = await db.select().from(users).where(eq(users.id, id));

    if (!userRow) {
      return null;
    }

    // Map raw DB row to UserEntity for type safety
    const userEntity = dbRowToUserEntity(userRow);

    // Map to DTO for safe return to client
    return toUserDto(userEntity);
  } catch (error) {
    logger.error({
      context: "fetchUserById",
      error,
      id,
      message: "Failed to fetch user by id.",
    });
    throw new DatabaseError("Failed to fetch user by id.", error);
  }
}

/**
 * Fetches the total number of user pages for pagination.
 * Always uses strict typing and constants.
 * @param db - The database instance.
 * @param query - Search query for username or email.
 * @returns Number of pages as a number.
 */
export async function fetchUsersPages(
  db: Database,
  query: string,
): Promise<number> {
  try {
    // Use Drizzle ORM to count users matching the query
    const [{ count: total } = { count: 0 }] = await db
      .select({ count: count(users.id) })
      .from(users)
      .where(
        or(
          ilike(users.username, `%${query}%`),
          ilike(users.email, `%${query}%`),
        ),
      );

    // Defensive: Ensure total is a valid number
    // const totalUsers = typeof total === "number" ? total : 0;

    // total is always a number, so no need for typeof check
    const totalUsers = total ?? 0;

    return Math.ceil(totalUsers / ITEMS_PER_PAGE_USERS);
  } catch (error) {
    logger.error({
      context: "fetchUsersPages",
      error,
      message: "Failed to fetch the total number of users.",
      query,
    });

    throw new DatabaseError(
      "Failed to fetch the total number of users.",
      error,
    );
  }
}

/**
 * Fetches filtered users for a specific page.
 * Always maps raw DB rows to UserEntity, then to UserDto.
 * @param db - The database instance.
 * @param query - Search query for username or email.
 * @param currentPage - Current page number (1-based).
 * @returns Array of UserDto for the page.
 */
export async function fetchFilteredUsers(
  db: Database,
  query: string,
  currentPage: number,
): Promise<UserDto[]> {
  // Calculate offset using constant for items per page
  const offset = (currentPage - 1) * ITEMS_PER_PAGE_USERS;
  try {
    // Fetch raw DB rows matching the query
    const userRows = await db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.username, `%${query}%`),
          ilike(users.email, `%${query}%`),
        ),
      )
      .orderBy(asc(users.username))
      .limit(ITEMS_PER_PAGE_USERS)
      .offset(offset);

    // Map each raw row to UserEntity, then to UserDto
    return userRows.map((row) => toUserDto(dbRowToUserEntity(row)));
  } catch (error) {
    logger.error({
      context: "fetchFilteredUsers",
      currentPage,
      error,
      message: "Failed to fetch filtered users.",
      query,
    });
    throw new DatabaseError("Failed to fetch filtered users.", error);
  }
}

/**
 * Increments and retrieves the demo user counter for a given role.
 * Ensures the returned value is a valid number.
 * @param db - The database instance (Drizzle)
 * @param role - The branded UserRole
 * @returns The new counter value as a number
 */
export async function demoUserCounter(
  db: Database,
  role: UserRole,
): Promise<number> {
  try {
    // Insert a new counter-row for the given role and return the new id
    const [counterRow] = await db
      .insert(demoUserCounters)
      .values({ count: 1, role })
      .returning();

    // Defensive: Ensure the counterRow and id are valid
    // if (!counterRow || typeof counterRow.id !== "number") {
    // 	throw new Error("Invalid counter row returned from database.");
    // }

    // Defensive: Ensure the counterRow and id are valid (id is always a number, so just check for nullish)
    if (!counterRow || counterRow.id == null) {
      throw new Error("Invalid counter row returned from database.");
    }

    return counterRow.id;
  } catch (error) {
    logger.error({
      context: "demoUserCounter",
      error,
      message: "Failed to read the demo user counter.",
      role,
    });
    throw new DatabaseError("Failed to read the demo user counter.", error);
  }
}

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
  role: UserRole,
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
    logger.error({
      context: "createDemoUser",
      error,
      id,
      message: "Failed to create a demo user.",
      role,
    });
    return null; // Return null on failure for safe downstream handling
  }
}
