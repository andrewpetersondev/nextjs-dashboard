import type { Hash } from "@/server/crypto/hashing/hashing.value.js";
import { users } from "@/server/db/schema/users.js";
import {
	USER_ROLE,
	type UserRole,
} from "@/shared/policies/user-role/user-role.constants.js";
import { nodeDb } from "../cli/node-db.js";
import { hashPassword } from "../seed-support/utils.js";

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
