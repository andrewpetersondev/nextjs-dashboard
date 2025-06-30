import { defineConfig } from "cypress";
import { dbTasks } from "./cypress/support/db-tasks.ts";

export default defineConfig({
	component: {
		devServer: {
			bundler: "webpack",
			framework: "next",
		},
		supportFile: "./cypress/support/index.ts",
	},
	e2e: {
		baseUrl: "http://localhost:3000",
		setupNodeEvents(on, config) {
			on("task", dbTasks);
			return config;
		},
	},
	env: {
		// biome-ignore lint/style/noProcessEnv: <ignore>
		// biome-ignore lint/style/useNamingConvention: <ignore>
		SESSION_SECRET: process.env.SESSION_SECRET,
	},
	fileServerFolder: ".",
	screenshotOnRunFailure: true,
	trashAssetsBeforeRuns: true,
	video: false,
	watchForFileChanges: false,
});
