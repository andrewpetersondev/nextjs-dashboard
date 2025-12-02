/** biome-ignore-all lint/style/noProcessEnv: <env config> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <env config> */
import { getDatabaseEnv } from "@/shared/config/env-shared";
import { ToolingEnvShape } from "./env-cli.schema";

// Build a normalized object from process.env (use UPPER_SNAKE names)
const envToValidate = {
  cypressBaseUrl: process.env.CYPRESS_BASE_URL,
  databaseEnv: process.env.DATABASE_ENV ?? getDatabaseEnv(),
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

export const DATABASE_ENV = parsed.data.databaseEnv;
export const DATABASE_URL = parsed.data.databaseUrl;
export const CYPRESS_BASE_URL = parsed.data.cypressBaseUrl;
export const SESSION_SECRET = parsed.data.sessionSecret;
