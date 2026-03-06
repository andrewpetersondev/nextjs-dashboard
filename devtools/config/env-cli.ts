// Use a relative import here because this file is loaded by tooling (Knip/Cypress/Node)
// which may not understand tsconfig path aliases like "@/*".
import { getDatabaseEnv } from "../../src/shared/core/config/shared/env-shared";
import { ToolingEnvShape } from "./env-cli.schema";

// Build a normalized object from process.env (use UPPER_SNAKE names)
// biome-ignore lint/nursery/useExplicitType: <fix later>
const envToValidate = {
	cypressBaseUrl: process.env.CYPRESS_BASE_URL,
	databaseEnv: process.env.DATABASE_ENV ?? getDatabaseEnv(),
	databaseUrl: process.env.DATABASE_URL,
	sessionSecret: process.env.SESSION_SECRET,
};

// biome-ignore lint/nursery/useExplicitType: <fix later>
const parsed = ToolingEnvShape.safeParse(envToValidate);
if (!parsed.success) {
	const details = parsed.error.flatten().fieldErrors;
	throw new Error(
		`Invalid build/tooling environment variables. See details:\n${JSON.stringify(
			details,
			null,
			2,
		)}`,
	);
}

// biome-ignore lint/nursery/useExplicitType: <fix later>
export const DATABASE_ENV = parsed.data.databaseEnv;
export const DATABASE_URL: string = parsed.data.databaseUrl;
export const CYPRESS_BASE_URL: string = parsed.data.cypressBaseUrl;
export const SESSION_SECRET: string = parsed.data.sessionSecret;
