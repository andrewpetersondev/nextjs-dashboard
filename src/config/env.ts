import "server-only";

import { z as zod } from "zod";

const envSchema = zod.object({
  POSTGRES_URL: zod.string().url(),
  POSTGRES_URL_TESTDB: zod.string().url(),
  SESSION_SECRET: zod.string(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  // you could throw a nice error or log details
  throw new Error("Invalid or missing environment variables");
}

export const POSTGRES_URL = env.data.POSTGRES_URL;

export const SESSION_SECRET = env.data.SESSION_SECRET;

export const POSTGRES_URL_TESTDB = env.data.POSTGRES_URL_TESTDB;
