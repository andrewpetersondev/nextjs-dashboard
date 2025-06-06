import { defineConfig } from "cypress";
import { eq } from "drizzle-orm";
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
				"db:insert": async (user: {
					username: string;
					email: string;
					password: string;
				}) => {
					const insertedUser = await testDB
						.insert(users)
						.values(user)
						.returning({
							username: users.username,
							email: users.email,
							password: users.password,
						});
					return insertedUser ? "User created" : "User creation failed";
				},
				"db:delete": async (email: string) => {
					const found = await testDB
						.select({ id: users.id })
						.from(users)
						.where(eq(users.email, email));
					if (!found.length) return "User not found";
					const userId = found[0].id;
					const deletedUser = await testDB
						.delete(users)
						.where(eq(users.id, userId));
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
