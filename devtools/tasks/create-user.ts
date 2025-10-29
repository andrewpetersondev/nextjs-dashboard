import { USER_ROLE, type UserRole } from "@/features/auth/lib/auth.roles";
import type { PasswordHash } from "@/features/auth/lib/password.types";
import { users } from "../../src/server/db/schema/users";
import { nodeDb } from "../cli/node-db";
import { hashPassword } from "../seed-support/utils";

export async function createUser(user: {
  email: string;
  password: PasswordHash;
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

  console.log("createUser", { email, role, username });
  await nodeDb.insert(users).values({ email, password, role, username });
}
