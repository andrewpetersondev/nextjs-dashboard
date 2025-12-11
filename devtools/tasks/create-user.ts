import {
  USER_ROLE,
  type UserRole,
} from "@/modules/auth/domain/roles/auth.roles";
import type { Hash } from "@/server/crypto/hashing/hashing.types";
import { users } from "@/server/db/schema/users";
import { nodeDb } from "../cli/node-db";
import { hashPassword } from "../seed-support/utils";

export async function createUser(user: {
  email: string;
  password: Hash;
  username: string;
  role?: UserRole;
}): Promise<void> {
  if (!user) {
    throw new Error("createUser requires a user object");
  }
  const email = user.email?.trim().toLowerCase();
  const username = user.username?.trim();
  const role = user.role ?? USER_ROLE;
  if (!(email && user.password && username)) {
    throw new Error("createUser requires email, password, and username");
  }

  const password = await hashPassword(user.password);

  await nodeDb.insert(users).values({ email, password, role, username });
}
