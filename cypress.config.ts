import { defineConfig } from "cypress";
import { dbTasks } from "./cypress/support/db-tasks";

export default defineConfig({
	component: {
		devServer: {
			bundler: "webpack",
			framework: "next",
		},
		indexHtmlFile: "cypress/support/component-index.html",
		screenshotOnRunFailure: true,
		specPattern: "cypress/component/**/*.{cy,spec}.tsx",
		supportFile: "cypress/support/component.ts",
		// video: true,
	},
	e2e: {
		baseUrl: "http://localhost:3000",
		screenshotOnRunFailure: true,
		setupNodeEvents(on, config) {
			on("task", dbTasks);
			return config;
		},
		specPattern: "cypress/e2e/**/*.{cy,spec}.ts",
		supportFile: "cypress/support/e2e.ts",
		// video: true,
	},
	screenshotsFolder: "cypress/screenshots",
	videosFolder: "cypress/videos",
});
