import process from "node:process";
import { CypressEnvShape } from "./cypress-env.schema";

const envToValidate = {
	cypressBaseUrl: process.env.CYPRESS_BASE_URL,
	databaseEnv: process.env.DATABASE_ENV,
	databaseUrl: process.env.DATABASE_URL,
	sessionSecret: process.env.SESSION_SECRET,
};

const parsed = CypressEnvShape.safeParse(envToValidate);

if (!parsed.success) {
	const details = parsed.error.flatten().fieldErrors;
	throw new Error(
		`Invalid Cypress environment variables. See details:\n${JSON.stringify(details, null, 2)}`,
	);
}

export const CYPRESS_BASE_URL: string = parsed.data.cypressBaseUrl;
export const DATABASE_ENV = parsed.data.databaseEnv;
export const DATABASE_URL: string = parsed.data.databaseUrl;
export const SESSION_SECRET: string = parsed.data.sessionSecret;
