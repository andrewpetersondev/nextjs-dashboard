import { defineConfig } from "cypress";
import { dbTasks } from "./cypress/support/db-tasks";

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
			on("task", dbTasks);
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
