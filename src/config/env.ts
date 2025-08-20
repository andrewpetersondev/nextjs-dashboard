import "server-only";

import * as z from "zod";

/**
 * Environment configuration and validation.
 *
 * This module validates required environment variables at runtime using Zod
 * and exports strongly-typed constants for use throughout the application.
 *
 * Why `server-only`?
 * - Ensures this module is only ever bundled/executed on the server. Secrets
 *   (like database URLs and session secrets) must never leak to the client.
 *
 * Usage example:
 *  import { POSTGRES_URL, SESSION_SECRET } from "@/src/config/env";
 *  // Use the validated values directly; do not access process.env elsewhere
 *
 * Adding new variables:
 * - Extend `envSchema` below with the new key and its Zod validator.
 * - Re-export the validated value at the bottom.
 * - Update the README in this folder with documentation and usage.
 */

const isTestEnv = process.env.NODE_ENV === "test";

const isProdEnv = process.env.NODE_ENV === "production";

const baseSchema = z.object({
  POSTGRES_URL: z.url(),
  SESSION_SECRET: z.string().min(1, "SESSION_SECRET cannot be empty"),
});

const testSchema = z.object({
  POSTGRES_URL_TESTDB: isTestEnv ? z.url() : z.url().optional(),
});

const prodSchema = z.object({
  POSTGRES_URL_PRODDB: isProdEnv ? z.url() : z.url().optional(),
});

const envSchema = baseSchema.and(testSchema).and(prodSchema);

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.flatten().fieldErrors;
  throw new Error(
    `Invalid or missing environment variables. See details:\n${JSON.stringify(details, null, 2)}`,
  );
}

export type Env = z.infer<typeof envSchema>;

export const POSTGRES_URL: Env["POSTGRES_URL"] = parsed.data.POSTGRES_URL;

export const SESSION_SECRET: Env["SESSION_SECRET"] = parsed.data.SESSION_SECRET;

/**
 * Test database connection string.
 * - Required when NODE_ENV=test.
 * - Optional otherwise to avoid forcing this in non-test environments.
 */
export const POSTGRES_URL_TESTDB: Env["POSTGRES_URL_TESTDB"] =
  parsed.data.POSTGRES_URL_TESTDB;

/**
 * Production database connection string.
 * - Required when NODE_ENV=production.
 * - Optional otherwise.
 */
export const POSTGRES_URL_PRODDB: Env["POSTGRES_URL_PRODDB"] =
  parsed.data.POSTGRES_URL_PRODDB;
