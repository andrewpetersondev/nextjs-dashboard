import process from "node:process";
import { ToolingEnvShape } from "@devtools/config/tooling-env.schema";

// Build a normalized object from process.env (use UPPER_SNAKE names)
const envToValidate = {
	databaseEnv: process.env.DATABASE_ENV,
	databaseUrl: process.env.DATABASE_URL,
	sessionSecret: process.env.SESSION_SECRET,
};

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

/**
 * The validated database connection string for build and tooling scripts.
 *
 * Importing this module throws if `DATABASE_ENV`, `DATABASE_URL`, or
 * `SESSION_SECRET` is missing or malformed — the other two are checked but not
 * exported, so this import doubles as a fail-fast presence check for all three.
 */
export const DATABASE_URL: string = parsed.data.databaseUrl;
