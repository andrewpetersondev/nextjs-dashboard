import { nodeDb } from "@cypress/db/node-db";
import {
	normalizeUserEmail,
	normalizeUsername,
	normalizeUserPassword,
} from "@cypress/shared/user-input.mapper";
import type { UserRole } from "@database/schema/schema.constants";
import type { Hash } from "@database/schema/schema.types";
import { users } from "@database/schema/users";
import bcryptjs from "bcryptjs";

function toHash(value: string): Hash {
	return value as unknown as Hash;
}

async function hashPassword(password: string): Promise<Hash> {
	const salt = await bcryptjs.genSalt(10);
	const hashedPassword = await bcryptjs.hash(password, salt);
	return toHash(hashedPassword);
}

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
