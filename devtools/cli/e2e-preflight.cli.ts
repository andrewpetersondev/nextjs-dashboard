import process from "node:process";

/**
 * E2E identity guard (Bug B of the port-reuse trap).
 *
 * start-server-and-test waits on the base URL but is identity-blind: it accepts
 * ANY 2xx/304 response, so a stale dev/preview server squatting the test port
 * is silently accepted and specs run against the wrong database. This guard runs
 * AFTER the server is ready and BEFORE Cypress: it asks `/api/health` which
 * database the live server is talking to and refuses to continue unless it is
 * the test DB. The non-secret `databaseEnv` field is exposed by the health route
 * outside production only. See BACKLOG "e2e port-reuse guard".
 */

const EXPECTED_DATABASE_ENV = "test";
const HEALTH_PATH = "/api/health";

/**
 * Deliberate mirror of `CYPRESS_BASE_URL`
 * (`cypress/node/config/cypress-env.ts`): the guard must probe exactly the URL
 * Cypress will target. Both read `process.env.PORT`, so when a stale exported
 * PORT beats the dotenv layer, both follow it to the same wrong server — which
 * is the case this guard exists to catch.
 */
function baseUrlFromEnv(): string {
	const port = process.env.PORT;
	if (!port) {
		throw new Error(
			"Usage: tsx devtools/cli/e2e-preflight.cli.ts <baseUrl>\n" +
				"Called without an argument, PORT must be set — run it through an " +
				"`env:test:*` wrapper so `.env.test.local` is loaded.",
		);
	}
	return `http://localhost:${port}`;
}

async function main(): Promise<void> {
	// The harness passes an explicit, PORT-pinned baseUrl. The interactive
	// scripts pass nothing and fall back to the env, so that `cy:open`/`cy:run`
	// are guarded too rather than only the harness path.
	const baseUrl = process.argv[2] ?? baseUrlFromEnv();

	const healthUrl = new URL(HEALTH_PATH, baseUrl).toString();

	const response = await fetch(healthUrl).catch((cause: unknown) => {
		throw new Error(`Could not reach ${healthUrl}.`, { cause });
	});

	if (!response.ok) {
		throw new Error(`${healthUrl} returned HTTP ${response.status}.`);
	}

	const body = (await response.json()) as {
		databaseEnv?: string;
		databaseName?: string;
	};

	if (body.databaseEnv !== EXPECTED_DATABASE_ENV) {
		throw new Error(
			`Refusing to run e2e against ${baseUrl}: server reports databaseEnv=` +
				`${body.databaseEnv ?? "(absent)"}, expected "${EXPECTED_DATABASE_ENV}". ` +
				"A non-test server is occupying the port — stop it and retry.",
		);
	}

	console.log(
		`[e2e-preflight] OK — ${baseUrl} is the test server (databaseEnv=test, db=${body.databaseName ?? "?"}).`,
	);
}

void main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
