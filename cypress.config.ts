import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import webpackBatteriesIncludedPreprocessor from "@cypress/webpack-batteries-included-preprocessor";
import { defineConfig } from "cypress";
import { CYPRESS_BASE_URL } from "./cypress/node/config/cypress-env";
import { registerCypressTasks } from "./cypress/node/tasks/register-tasks";

// Anchor resolution to the project root so the preprocessor compiles specs with
// the project's TypeScript, not one bundled in the Cypress app.
const projectRequire = createRequire(path.join(process.cwd(), "package.json"));

export default defineConfig({
	e2e: {
		baseUrl: CYPRESS_BASE_URL,

		setupNodeEvents(on, config) {
			config.baseUrl = CYPRESS_BASE_URL;

			// Secrets (DATABASE_URL, SESSION_SECRET) are deliberately NOT written
			// into config.env — under Cypress 16 that key is reachable from specs
			// via `cy.env()`. DB-env assertions go through the Node-side `db:env`
			// task, which returns only a non-secret summary.
			registerCypressTasks(on, config);

			// TypeScript 7 dropped the compiler API that Cypress's built-in
			// ts-loader preprocessing relies on. Cypress 15.19+ falls back to
			// Babel, but the copy bundled inside the Cypress app is packed
			// incompletely (@babel/preset-typescript unresolvable), so wire the
			// npm preprocessor, whose dependencies resolve from this project.
			on(
				"file:preprocessor",
				webpackBatteriesIncludedPreprocessor({
					typescript: projectRequire.resolve("typescript"),
				}),
			);

			return config;
		},
		specPattern: "cypress/e2e/**/*.cy.ts",
		supportFile: "cypress/support/e2e.ts",
	},
	// Both deliberately empty, and they are no longer the same channel: Cypress 16
	// removed `Cypress.env()` outright, splitting `config.env` (sensitive, read
	// asynchronously via `cy.env()`, yields only the keys asked for) from `expose`
	// (public, read synchronously via `Cypress.expose()`). The `allowCypressEnv:
	// false` that used to sit above was the 15-era way to shut the old blanket
	// accessor off; 16 removed the option along with the API, so the framework now
	// enforces what that line asserted. Secrets still never reach either key —
	// DATABASE_URL and SESSION_SECRET stay Node-side and specs read the `db:env`
	// task's non-secret summary — so nothing here depends on that split.
	env: {},
	expose: {},
	// Explicit rather than inherited: a flake must fail loudly. Retrying would
	// report an intermittently-failing test as green, and every other guard in
	// this repo (CSP, prod-DB, blocking axe) is deliberately loud. The accepted
	// cost is that a genuine infra hiccup reds the build and needs a re-run.
	// Revisit if the suite grows enough that infra noise outweighs the signal.
	retries: { openMode: 0, runMode: 0 },
	video: false,
	watchForFileChanges: true,
});
