/**
 * This file for the Auth User Creation Flow (signup)
 *
 * DAL is intentionally minimal and specific to the auth flow, so it does not
 * leak admin-only capabilities (e.g., arbitrary roles, system flags).
 */

import type { SignupFormOutput } from "@/features/auth/lib/auth.schema";
import type { Database } from "@/server/db/connection";
import { users } from "@/server/db/schema";
import type { UserEntity } from "@/server/users/entity";
import { userDbRowToEntity } from "@/server/users/mapper";

/**
 * Input for the auth-signup DAL: strictly what the public signup form provides.
 */
export type AuthSignupDalInput = Pick<
  SignupFormOutput,
  "email" | "password" | "username"
>;

/**
 * Creates a user record for the auth/signup flow.
 * - Ensures email/username uniqueness at the DB level
 * - Hashes password before persisting
 * - Returns a normalized UserEntity
 */
export async function dalAuthFlowSignup(
  db: Database,
  input: AuthSignupDalInput,
): Promise<UserEntity> {
  const [userRow] = await db.insert(users).values(input).returning();

  if (!userRow) {
    throw new Error(
      "fix this later. add another check because !userRow does not cover all cases",
    );
  }
  return userDbRowToEntity(userRow);
}
