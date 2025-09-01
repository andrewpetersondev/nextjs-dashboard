/** biome-ignore-all lint/style/noProcessEnv: <temp> */
/** biome-ignore-all lint/correctness/noProcessGlobal: <temp> */

/**
 * Environment configuration and validation.
 * This module validates required environment variables at runtime using Zod
 */

import "server-only";

import { z } from "zod";
import type { DatabaseEnv } from "@/server/config/types";

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

const isTestEnv: boolean = DATABASE_ENV_INTERNAL === "test";
const isProdEnv: boolean = DATABASE_ENV_INTERNAL === "production";

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

export const DATABASE_ENV: DatabaseEnv = DATABASE_ENV_INTERNAL;
