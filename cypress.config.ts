import { defineConfig } from "cypress";
import { db } from "./src/db/test-database";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

export default defineConfig({
	e2e: {
		supportFile: "cypress/support/e2e.ts",
		specPattern: "cypress/e2e/**/*.{cy,spec}.ts",
		screenshotOnRunFailure: true,
		video: true,
		baseUrl: "http://localhost:3000",
		setupNodeEvents(on, config) {
			on("task", {

				"logToConsole": (message) => {
					console.log("log: ", message);
					return null;
				},
				"db:insert": async (user) => {
					const insertedUser = await db.insert(users).values(user).returning({ username: users.username, email: users.email, password: users.password });
					return insertedUser ? "User created" : "User creation failed";
				},
				"db:delete": async (email) => {
					const deletedUser = await db.delete(users).where(eq(users.email, email));
					return deletedUser ? "User deleted" : "User deletion failed";
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
