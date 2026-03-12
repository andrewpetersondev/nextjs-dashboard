import { type Hash, type UserRole, users } from "@database";
import bcryptjs from "bcryptjs";
import { nodeDb } from "../../db/node-db";
import {
	normalizeUserEmail,
	normalizeUsername,
	normalizeUserPassword,
} from "../../shared/user-input.mapper";

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
