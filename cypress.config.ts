import { defineConfig } from "cypress";
import * as dotenv from "dotenv";
import {
	CYPRESS_BASE_URL,
	DATABASE_ENV,
	DATABASE_URL,
	SESSION_SECRET,
} from "./cypress/node/config/cypress-env";
import { registerCypressTasks } from "./cypress/node/tasks/register-tasks";

export default defineConfig({
	e2e: {
		baseUrl: "http://localhost:3000",

		// biome-ignore lint/suspicious/useAwait: setupNodeEvents may remain async for future async setup
		async setupNodeEvents(on, config) {
			dotenv.config({ path: ".env.test.local" });

			config.baseUrl = CYPRESS_BASE_URL;
			config.env.DATABASE_ENV = DATABASE_ENV;
			config.env.DATABASE_URL = DATABASE_URL;
			config.env.SESSION_SECRET = SESSION_SECRET;

			registerCypressTasks(on, config);

			return config;
		},
	},
	env: {},
	video: false,
	watchForFileChanges: false,
});
