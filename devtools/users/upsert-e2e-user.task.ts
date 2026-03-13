import type { UserRole } from "@database/schema/schema.constants";
import { users } from "@database/schema/users";
import { nodeDb } from "@devtools/shared/db/node-db";
import {
	normalizeUserEmail,
	normalizeUserPassword,
	toUsernameFromEmail,
	validateRequiredUserTaskInput,
} from "@devtools/shared/user-input.mapper";
import { hashPassword } from "@devtools/users/hash-password";
import { eq } from "drizzle-orm";

/** Upsert an E2E user and invalidate existing sessions. */
export async function upsertE2eUserTask(user: {
	email: string;
	password: string;
	role: UserRole;
}): Promise<void> {
	if (!user) {
		throw new Error("upsertE2EUser requires user object");
	}

	validateRequiredUserTaskInput(user);

	const normalizedEmail = normalizeUserEmail(user.email);
	const normalizedPassword = normalizeUserPassword(user.password);
	const username = toUsernameFromEmail(normalizedEmail);
	const role = user.role;

	const hashed = await hashPassword(normalizedPassword);

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
			const userId = row.id;

			await tx
				.update(users)
				.set({ password: hashed, role, username })
				.where(eq(users.id, userId));
		} else {
			const inserted = await tx
				.insert(users)
				.values([{ email: normalizedEmail, password: hashed, role, username }])
				.returning({ id: users.id });

			if (inserted.length === 0 || !inserted[0]?.id) {
				throw new Error("Failed to insert E2E user");
			}
		}
	});
}
