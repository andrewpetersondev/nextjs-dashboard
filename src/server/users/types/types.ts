import "server-only";

import type { UserEntity } from "@/server/users/types/entity";

export type UserUpdatePatch = Partial<
  Pick<UserEntity, "username" | "email" | "role" | "password">
>;

/**
 * Input for the auth-signup DAL: strictly what the public signup form provides.
 * NOTE: DAL expects a pre-hashed password (passwordHash), not a raw password.
 */
export type AuthSignupDalInput = Pick<
  UserEntity,
  "email" | "username" | "password" | "role"
>;

export type AuthLoginDalInput = Pick<UserEntity, "email" | "password">;
