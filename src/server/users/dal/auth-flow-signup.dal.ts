/**
 * This file for the Auth User Creation Flow (signup)
 *
 * DAL is intentionally minimal and specific to the auth flow, so it does not
 * leak admin-only capabilities (e.g., arbitrary roles, system flags).
 */

import type { SignupFormOutput } from "@/features/auth/lib/auth.schema";
import { toUserRole } from "@/features/users/lib/to-user-role";
import type { Database } from "@/server/db/connection";
import { users } from "@/server/db/schema";
import { DatabaseError } from "@/server/errors/infrastructure";
import { ConflictError } from "@/server/users/auth-flow-repo.user";
import type { UserEntity } from "@/server/users/entity";
import { userDbRowToEntity } from "@/server/users/mapper";

/**
 * Input for the auth-signup DAL: strictly what the public signup form provides.
 * NOTE: DAL expects a pre-hashed password (passwordHash), not a raw password.
 */
export type AuthSignupDalInput = Pick<
  SignupFormOutput,
  "email" | "username" | "password"
>;

/**
 * Creates a user record for the auth/signup flow.
 * - Ensures email/username uniqueness at the DB level
 * - Expects passwordHash to be computed by the service layer
 * - Returns a normalized UserEntity
 */
export async function dalAuthFlowSignup(
  db: Database,
  input: AuthSignupDalInput,
): Promise<UserEntity> {
  try {
    const [userRow] = await db
      .insert(users)
      .values({
        email: input.email,
        password: input.password,
        role: toUserRole("user"),
        username: input.username,
      })
      .returning();

    if (!userRow) {
      throw new DatabaseError("Failed to create user (no row returned).");
    }

    return userDbRowToEntity(userRow);
  } catch (err: any) {
    const isUniqueViolation =
      err?.code === "23505" ||
      err?.name === "UniqueConstraintError" ||
      /unique/i.test(String(err?.message));

    if (isUniqueViolation) {
      throw new ConflictError(
        "A user with that email or username already exists.",
        { cause: err },
      );
    }

    if (err instanceof DatabaseError) {
      throw err;
    }
    throw new DatabaseError("Database error during auth signup.", {}, err);
  }
}
