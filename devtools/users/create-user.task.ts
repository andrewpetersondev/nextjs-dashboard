import type { UserRole } from "@database/schema/schema.constants";
import { users } from "@database/schema/users";
import { nodeDb } from "@devtools/shared/db/node-db";
import {
	normalizeUserEmail,
	normalizeUsername,
	normalizeUserPassword,
} from "@devtools/shared/user-input.mapper";
import { hashPassword } from "@devtools/users/hash-password";

export async function createUserTask(user: {
	email: string;
	password: string;
	role: UserRole;
	username: string;
}): Promise<void> {
	if (!user) {
		throw new Error("createUser requires a user object");
	}

	const email = normalizeUserEmail(user.email);
	const password = normalizeUserPassword(user.password);
	const role = user.role;
	const username = normalizeUsername(user.username);

	const hashedPassword = await hashPassword(password);

	await nodeDb.insert(users).values({
		email,
		password: hashedPassword,
		role,
		username,
	});
}
