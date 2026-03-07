import { users } from "@database/schema/users";
import type { Hash } from "@/server/crypto/hashing/hashing.value";
import {
	USER_ROLE,
	type UserRole,
} from "@/shared/policies/user-role/user-role.constants";
import { nodeDb } from "../shared/db/node-db";
import { hashPassword } from "./hash-password";

export async function createUserTask(user: {
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
