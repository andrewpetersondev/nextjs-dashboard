import { nodeDb } from "../cli/node-db";
import { users } from "../schema/users";
import { hashPassword } from "../seed-support/utils";

export async function createUser(user: {
  email: string;
  password: string;
  username: string;
  role?: "user" | "admin" | "guest";
}): Promise<void> {
  if (!user) {
    throw new Error("createUser requires a user object");
  }
  const email = user.email?.trim().toLowerCase();
  const username = user.username?.trim();
  const role = user.role ?? "user";
  if (!email || !user.password || !username) {
    throw new Error("createUser requires email, password, and username");
  }

  const password = await hashPassword(user.password);

  console.log("createUser", { email, role, username });
  await nodeDb.insert(users).values({ email, password, role, username });
}
