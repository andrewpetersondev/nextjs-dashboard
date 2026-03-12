import { type Hash, type UserRole, users } from "@database";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";
import { nodeDb } from "../../db/node-db";
import {
	normalizeUserEmail,
	normalizeUserPassword,
	toUsernameFromEmail,
	validateRequiredUserTaskInput,
} from "../../shared/user-input.mapper";

function toHash(value: string): Hash {
	return value as unknown as Hash;
}

async function hashPassword(password: string): Promise<Hash> {
	const salt = await bcryptjs.genSalt(10);
	const hashedPassword = await bcryptjs.hash(password, salt);
	return toHash(hashedPassword);
}

/** Upsert an E2E user. */
export async function upsertE2eUserTask(user: {
	email: string;
	password: string;
	role: UserRole;
	username: string;
}): Promise<void> {
	if (!user) {
		throw new Error("upsertE2EUser requires user object");
	}

	validateRequiredUserTaskInput(user);

	const normalizedEmail = normalizeUserEmail(user.email);
	const normalizedPassword = normalizeUserPassword(user.password);
	const username = toUsernameFromEmail(normalizedEmail);
	const role = user.role;

	const hashedPassword = await hashPassword(normalizedPassword);

	await nodeDb.transaction(async (tx) => {
		const existing = await tx
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, normalizedEmail))
			.limit(1);

		if (existing.length > 0) {
			const row = existing[0];

			if (!row) {
				throw new Error("Invariant: expected an existing user row");
			}

			await tx
				.update(users)
				.set({ password: hashedPassword, role, username })
				.where(eq(users.id, row.id));

			return;
		}

		const inserted = await tx
			.insert(users)
			.values([
				{
					email: normalizedEmail,
					password: hashedPassword,
					role,
					username,
				},
			])
			.returning({ id: users.id });

		if (inserted.length === 0 || !inserted[0]?.id) {
			throw new Error("Failed to insert E2E user");
		}
	});
}
