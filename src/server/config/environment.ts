/**
 * Environment configuration and validation.
 * This module validates required environment variables at runtime using Zod
 */

import "server-only";

import { z } from "zod";

type DatabaseEnv = "development" | "test" | "production";

function normalizeDbEnv(value: string | undefined): DatabaseEnv {
  switch (value) {
    case "test":
      return "test";
    case "production":
      return "production";
    case "development":
      return "development";
    default:
      return "development";
  }
}

const DATABASE_ENV_INTERNAL: DatabaseEnv = normalizeDbEnv(
  process.env.DATABASE_ENV ?? process.env.NODE_ENV,
);

// Prefer DATABASE_URL. Keep legacy vars optional for backward-compat resolution below.
const envSchema = z.object({
  DATABASE_URL: z.url().optional(),
  POSTGRES_URL: z.url().optional(),
  POSTGRES_URL_PRODDB: z.url().optional(),
  POSTGRES_URL_TESTDB: z.url().optional(),
  SESSION_SECRET: z.string().min(1, "SESSION_SECRET cannot be empty"),
  // Optional opt-in flag to require DATABASE_URL strictly
  STRICT_DATABASE_URL: z
    .string()
    .optional()
    .transform((v) => (v ?? "").toLowerCase() === "true"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.flatten().fieldErrors;
  throw new Error(
    `Invalid or missing environment variables. See details:\n${JSON.stringify(details, null, 2)}`,
  );
}

type Env = z.infer<typeof envSchema>;

function resolveDatabaseUrl(env: DatabaseEnv, data: Env): string {
  // 1) Preferred: single-per-env var
  if (data.DATABASE_URL) {
    return data.DATABASE_URL;
  }

  // If strict mode is on, fail fast when DATABASE_URL is missing
  const msgByEnv: Record<DatabaseEnv, string> = {
    development:
      "Missing DATABASE_URL. Define it in .env.development (recommended) to enable strict mode.",
    production:
      "Missing DATABASE_URL. Define it in the production environment (recommended) to enable strict mode.",
    test: "Missing DATABASE_URL. Define it in .env.test (recommended) to enable strict mode.",
  };
  if (data.STRICT_DATABASE_URL) {
    throw new Error(msgByEnv[env]);
  }

  // 2) Back-compat: pick by environment
  if (env === "test" && data.POSTGRES_URL_TESTDB) {
    return data.POSTGRES_URL_TESTDB;
  }
  if (env === "production" && data.POSTGRES_URL_PRODDB) {
    return data.POSTGRES_URL_PRODDB;
  }

  // 3) Legacy default/dev
  if (data.POSTGRES_URL) {
    return data.POSTGRES_URL;
  }

  // 4) Helpful error per env
  const legacyMsgByEnv: Record<DatabaseEnv, string> = {
    development:
      "Missing database URL. Define DATABASE_URL in .env.development, or set POSTGRES_URL.",
    production:
      "Missing database URL. Define DATABASE_URL in production env, or set POSTGRES_URL_PRODDB.",
    test: "Missing database URL. Define DATABASE_URL in .env.test, or set POSTGRES_URL_TESTDB.",
  };
  throw new Error(legacyMsgByEnv[env]);
}

export const SESSION_SECRET: Env["SESSION_SECRET"] = parsed.data.SESSION_SECRET;

// Single resolved URL the app should use everywhere
export const DATABASE_URL: string = resolveDatabaseUrl(
  DATABASE_ENV_INTERNAL,
  parsed.data,
);

// Deprecated exports (kept for compatibility where still imported)
export const POSTGRES_URL: Env["POSTGRES_URL"] = parsed.data.POSTGRES_URL;
export const POSTGRES_URL_TESTDB: Env["POSTGRES_URL_TESTDB"] =
  parsed.data.POSTGRES_URL_TESTDB;
export const POSTGRES_URL_PRODDB: Env["POSTGRES_URL_PRODDB"] =
  parsed.data.POSTGRES_URL_PRODDB;

export const DATABASE_ENV: DatabaseEnv = DATABASE_ENV_INTERNAL;

// Export strict flag for observability if needed
export const STRICT_DATABASE_URL: boolean = parsed.data.STRICT_DATABASE_URL;
