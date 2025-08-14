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
const envSchema = z.object({
  /**
   * Primary database connection string.
   * Must be a valid URL, e.g., postgres://user:pass@host:5432/db
   */
  POSTGRES_URL: z.url(),

  /**
   * Test database connection string used by tests and local tooling.
   * Must be a valid URL.
   */
  POSTGRES_URL_TESTDB: z.url(),

  /**
   * Secret used for signing sessions/cookies or crypto operations.
   * Keep this long, random, and private.
   */
  SESSION_SECRET: z.string().min(1, "SESSION_SECRET cannot be empty"),
});

// Validate environment eagerly so the app fails fast with clear diagnostics.
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Provide actionable feedback to developers by printing validation errors.
  const details = parsed.error.flatten().fieldErrors;
  // Note: This error will be thrown at startup and should be visible in logs.
  throw new Error(
    `Invalid or missing environment variables. See details:\n${JSON.stringify(details, null, 2)}`,
  );
}

/**
 * The validated and typed shape of environment variables.
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Primary database connection string (validated URL).
 */
export const POSTGRES_URL: Env["POSTGRES_URL"] = parsed.data.POSTGRES_URL;

/**
 * Secret used for signing sessions/cookies (non-empty string).
 */
export const SESSION_SECRET: Env["SESSION_SECRET"] = parsed.data.SESSION_SECRET;

/**
 * Test database connection string (validated URL).
 */
export const POSTGRES_URL_TESTDB: Env["POSTGRES_URL_TESTDB"] =
  parsed.data.POSTGRES_URL_TESTDB;
