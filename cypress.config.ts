import { defineConfig } from "cypress";
import {
	CYPRESS_BASE_URL,
	DATABASE_ENV,
	DATABASE_URL,
	SESSION_SECRET,
} from "./cypress/node/config/cypress-env";
import { registerCypressTasks } from "./cypress/node/tasks/register-tasks";

export default defineConfig({
	allowCypressEnv: false,
	e2e: {
		baseUrl: CYPRESS_BASE_URL,

		setupNodeEvents(on, config) {
			config.baseUrl = CYPRESS_BASE_URL;
			config.env.DATABASE_ENV = DATABASE_ENV;
			config.env.DATABASE_URL = DATABASE_URL;
			config.env.SESSION_SECRET = SESSION_SECRET;

			registerCypressTasks(on, config);

			return config;
		},
		specPattern: "cypress/e2e/**/*.cy.ts",
		supportFile: "cypress/support/e2e.ts",
	},
	env: {},
	expose: {},
	video: false,
	watchForFileChanges: true,
});
