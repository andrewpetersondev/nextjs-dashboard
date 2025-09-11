import { z } from "zod";
import {
  type DatabaseEnv,
  DatabaseEnvEnum,
} from "../../src/shared/config/env-shared";

const MIN_LENGTH = 20;

const nodeToolingEnvSchema = z.object({
  CYPRESS_BASE_URL: z.url(),
  DATABASE_ENV: DatabaseEnvEnum,
  DATABASE_URL: z.url(),
  SESSION_SECRET: z
    .string()
    .min(MIN_LENGTH, `SESSION_SECRET must be at least ${MIN_LENGTH} chars`),
});

const parsed = nodeToolingEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.flatten().fieldErrors;
  throw new Error(
    `Invalid build/tooling environment variables. See details:\n${JSON.stringify(details, null, 2)}`,
  );
}

const data = parsed.data;

export const DATABASE_ENV: DatabaseEnv = data.DATABASE_ENV;
export const DATABASE_URL = data.DATABASE_URL;
export const CYPRESS_BASE_URL = data.CYPRESS_BASE_URL;
export const SESSION_SECRET = data.SESSION_SECRET;
