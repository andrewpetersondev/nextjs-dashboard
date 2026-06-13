import process from "node:process";
import { CypressEnvShape } from "./cypress-env.schema";

const envToValidate = {
	authBcryptSaltRounds: process.env.AUTH_BCRYPT_SALT_ROUNDS,
	databaseEnv: process.env.DATABASE_ENV,
	databaseUrl: process.env.DATABASE_URL,
	port: process.env.PORT,
	sessionSecret: process.env.SESSION_SECRET,
};

const parsed = CypressEnvShape.safeParse(envToValidate);

if (!parsed.success) {
	const details = parsed.error.flatten().fieldErrors;
	throw new Error(
		`Invalid Cypress environment variables. See details:\n${JSON.stringify(details, null, 2)}`,
	);
}

export const AUTH_BCRYPT_SALT_ROUNDS: number = parsed.data.authBcryptSaltRounds;
export const CYPRESS_BASE_URL: string = `http://localhost:${parsed.data.port}`;
export const DATABASE_ENV = parsed.data.databaseEnv;
export const DATABASE_URL: string = parsed.data.databaseUrl;
// `sessionSecret` is still validated above (fail-fast on a misconfigured
// .env.test.local) but intentionally not exported: Cypress never needs it, and
// re-exporting it invites leaking it back into browser-side Cypress.env().
