import { toUsernameFromEmail } from "@cypress/node/mappers/user-input.mapper";
import { cleanupE2eUsersTask } from "@cypress/node/tasks/cleanup-e2e-users.task";
import { createUserTask } from "@cypress/node/tasks/create-user.task";
import { deleteUserTask } from "@cypress/node/tasks/delete-user.task";
import { seedDatabaseTask } from "@cypress/node/tasks/seed-database.task";
import { upsertE2eUserTask } from "@cypress/node/tasks/upsert-e2e-user.task";
import { userExistsTask } from "@cypress/node/tasks/user-exists.task";
import type { UserRole } from "@database/schema/schema.constants";

type CreateUserTaskInput = {
	email: string;
	password: string;
	role: UserRole;
	username: string;
};

type SetupUserTaskInput = {
	email: string;
	password: string;
	role: UserRole;
};

function createCallOkJson(config: Cypress.PluginConfigOptions) {
	return async function callOkJson(path: string): Promise<null> {
		if (!config.baseUrl) {
			throw new Error(
				"Cypress baseUrl is not set. Provide CYPRESS_BASE_URL in .env.test.local.",
			);
		}

		const url = new URL(path, config.baseUrl).toString();
		const response = await fetch(url, { method: "GET" });
		const body = await response.json().catch(() => ({}));

		if (
			!response.ok ||
			(body && typeof body === "object" && "ok" in body && body.ok === false)
		) {
			throw new Error(
				`${path} failed: status=${response.status} body=${JSON.stringify(body)}`,
			);
		}

		return null;
	};
}

export function registerCypressTasks(
	on: Cypress.PluginEvents,
	config: Cypress.PluginConfigOptions,
): void {
	const callOkJson = createCallOkJson(config);

	on("task", {
		async "db:cleanup"() {
			await cleanupE2eUsersTask();
			return null;
		},

		async "db:createUser"(user: CreateUserTaskInput) {
			await createUserTask(user);
			return null;
		},
		async "db:deleteUser"(email: string) {
			await deleteUserTask(email);
			return null;
		},
		async "db:reset"() {
			return await callOkJson("/api/db/reset");
		},
		async "db:seed"() {
			// Seeds directly via drizzle (no /api/db/seed route exists).
			// Requires an empty DB, so callers reset first (cy.dbResetAndSeed).
			await seedDatabaseTask();
			return null;
		},

		async "db:setup"(user: SetupUserTaskInput) {
			await upsertE2eUserTask({
				...user,
				username: toUsernameFromEmail(user.email),
			});
			return null;
		},
		async "db:userExists"(email: string) {
			return await userExistsTask(email);
		},
	});
}
