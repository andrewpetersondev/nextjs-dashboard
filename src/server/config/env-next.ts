/**
 * File: env-next.ts
 * Purpose: Next.js server runtime environment configuration and validation.
 *
 * Scope and boundaries:
 * - Marked "server-only": must not be imported by client components.
 * - Intended for server code only (route handlers, server actions, DB, etc.).
 * - Reads process.env at runtime and validates required secrets.
 *
 * Behavior:
 * - Resolves DATABASE_ENV via deriveDatabaseEnv(DATABASE_ENV, NODE_ENV).
 * - Validates SESSION_SECRET and database URL inputs.
 * - Database URL: requires DATABASE_URL. If STRICT_DATABASE_URL is true and DATABASE_URL is missing, throws an environment-specific error.
 *
 * Exports:
 * - SESSION_SECRET, DATABASE_URL, DATABASE_ENV, STRICT_DATABASE_URL
 */

import "server-only";

import { z } from "zod";
import {
  type DatabaseEnv,
  deriveDatabaseEnv,
} from "@/shared/config/env-shared";
import { type LogLevel, LogLevelSchema } from "@/shared/logging/log-level";

const NON_EMPTY_STRING_MIN_LENGTH = 1 as const;

const DATABASE_ENV_INTERNAL: DatabaseEnv = deriveDatabaseEnv(
  process.env.DATABASE_ENV,
  process.env.NODE_ENV,
);

// Prefer DATABASE_URL exclusively.
const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  // Optional server log level override
  LOG_LEVEL: LogLevelSchema.optional(),
  SESSION_SECRET: z
    .string()
    .min(NON_EMPTY_STRING_MIN_LENGTH, "SESSION_SECRET cannot be empty"),
  STRICT_DATABASE_URL: z
    .string()
    .optional()
    .transform((v) => (v ?? "").toLowerCase() === "true"),
});

// Validate and fail fast with helpful errors
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

  // Helpful error per env when not strict: suggest defining DATABASE_URL
  const msgByEnvNonStrict: Record<DatabaseEnv, string> = {
    development:
      "Missing database URL. Define DATABASE_URL in .env.development.",
    production:
      "Missing database URL. Define DATABASE_URL in the production environment.",
    test: "Missing database URL. Define DATABASE_URL in .env.test.",
  };
  throw new Error(msgByEnvNonStrict[env]);
}

export const SESSION_SECRET: Env["SESSION_SECRET"] = parsed.data.SESSION_SECRET;
export const DATABASE_URL: string = resolveDatabaseUrl(
  DATABASE_ENV_INTERNAL,
  parsed.data,
);
export const DATABASE_ENV: DatabaseEnv = DATABASE_ENV_INTERNAL;
export const LOG_LEVEL: LogLevel | undefined = parsed.data.LOG_LEVEL;
export const STRICT_DATABASE_URL: boolean = parsed.data.STRICT_DATABASE_URL;
