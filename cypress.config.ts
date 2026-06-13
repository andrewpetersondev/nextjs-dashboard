import { defineConfig } from "cypress";
import { CYPRESS_BASE_URL } from "./cypress/node/config/cypress-env";
import { registerCypressTasks } from "./cypress/node/tasks/register-tasks";

export default defineConfig({
	// Hard-disable browser-side `Cypress.env()` (defaults to enabled in Cypress
	// 15). Specs read no env values directly — DB-env checks go through the
	// Node-side `db:env` task — so this closes the exposure even if a value is
	// ever added to `config.env` later. Also silences the deprecation warning.
	allowCypressEnv: false,
	e2e: {
		baseUrl: CYPRESS_BASE_URL,

		setupNodeEvents(on, config) {
			config.baseUrl = CYPRESS_BASE_URL;

			// Secrets (DATABASE_URL, SESSION_SECRET) are deliberately NOT written
			// into config.env — anything there is readable browser-side via
			// Cypress.env(). DB-env assertions go through the Node-side `db:env`
			// task, which returns only a non-secret summary.
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
