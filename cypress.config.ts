import { defineConfig } from "cypress";
import { eq } from "drizzle-orm";
import type { UserEntity } from "./src/db/entities/user.ts";
import { users } from "./src/db/schema";
import { testDB } from "./src/db/test-database";

export default defineConfig({
	screenshotsFolder: "cypress/screenshots",
	videosFolder: "cypress/videos",
	e2e: {
		supportFile: "cypress/support/e2e.ts",
		specPattern: "cypress/e2e/**/*.{cy,spec}.ts",
		screenshotOnRunFailure: true,
		video: true,
		baseUrl: "http://localhost:3000",
		setupNodeEvents(on, config) {
			on("task", {
				logToConsole: (message: string) => {
					console.log("log: ", message);
					return null;
				},
				"db:insert": async (user: UserEntity) => {
					try {
						const [insertedUser] = await testDB
							.insert(users)
							.values(user)
							.returning();
						return insertedUser ? "User created" : "User creation failed";
					} catch (error) {
						console.error("db:insert error", error);
						return "User creation failed";
					}
				},
				"db:find": async (email: string) => {
					try {
						const [user] = await testDB
							.select()
							.from(users)
							.where(eq(users.email, email));
						return user ?? null;
					} catch (error) {
						console.error("db:find error", error);
						return null;
					}
				},
				"db:update": async ({
					email,
					updates,
				}: {
					email: string;
					updates: Partial<UserEntity>;
				}) => {
					try {
						const [found] = await testDB
							.select({ id: users.id })
							.from(users)
							.where(eq(users.email, email));
						if (!found) return "User not found";
						const [updatedUser] = await testDB
							.update(users)
							.set(updates)
							.where(eq(users.id, found.id))
							.returning();
						return updatedUser ? "User updated" : "User update failed";
					} catch (error) {
						console.error("db:update error", error);
						return "User update failed";
					}
				},
				"db:delete": async (email: string) => {
					try {
						const [found] = await testDB
							.select({ id: users.id })
							.from(users)
							.where(eq(users.email, email));
						if (!found) return "User not found";
						await testDB.delete(users).where(eq(users.id, found.id));
						return "User deleted";
					} catch (error) {
						console.error("db:delete error", error);
						return "User deletion failed";
					}
				},
			});
			return config;
		},
	},
	component: {
		supportFile: "cypress/support/component.ts",
		indexHtmlFile: "cypress/support/component-index.html",
		specPattern: "cypress/component/**/*.{cy,spec}.tsx",
		screenshotOnRunFailure: true,
		video: true,
		devServer: {
			framework: "next",
			bundler: "webpack",
		},
	},
});
