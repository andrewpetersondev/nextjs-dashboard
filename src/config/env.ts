import "server-only";

import * as z from "zod";

/**
 * Environment variable schema for the application.
 * Validates that required variables are present and correctly formatted.
 */
const envSchema = z.object({
  POSTGRES_URL: z.url(),
  POSTGRES_URL_TESTDB: z.url(),
  SESSION_SECRET: z.string(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  // you could throw a nice error or log details
  throw new Error("Invalid or missing environment variables");
}

export const POSTGRES_URL = env.data.POSTGRES_URL;

export const SESSION_SECRET = env.data.SESSION_SECRET;

export const POSTGRES_URL_TESTDB = env.data.POSTGRES_URL_TESTDB;
