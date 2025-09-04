/**
 * File: env-node.ts
 * Purpose: Node-only/CI environment configuration and validation for tooling contexts.
 *
 * Scope and boundaries:
 * - Executed in Node.js processes (not bundled to client).
 * - Safe contexts: cypress.config.ts, build scripts, migrations/seeds, next.config.ts.
 * - Avoid importing server-only modules; this file must remain framework-agnostic.
 * - Reading process.env is allowed here.
 *
 * Behavior:
 * - Validates and exposes minimal variables needed by tooling.
 * - DATABASE_ENV is derived with deriveDatabaseEnv(DATABASE_ENV, NODE_ENV).
 * - PORT coerced with a default (from shared DEFAULT_PORT).
 * - CYPRESS_BASE_URL falls back to http://localhost:${PORT} if not provided.
 *
 * Exports:
 * - NODE_ENV, DATABASE_ENV, DATABASE_URL, PORT, CYPRESS_BASE_URL, SESSION_SECRET
 * - NODE_ENV_VARS: convenience aggregate preserving computed values
 */

import process from "node:process";
import { z } from "zod";
import {
  coercePort,
  type DatabaseEnv,
  DatabaseEnvSchema,
  DEFAULT_PORT,
  deriveDatabaseEnv,
  ENVIRONMENTS,
} from "../src/shared/config/env-shared";

// Minimal shape for build/tooling needs. Extend as necessary.
const nodeToolingEnvSchema = z.object({
  // Base URL for Cypress; if not provided, we derive from PORT
  CYPRESS_BASE_URL: z.string().url().optional(),

  // Prefer using the shared tuple to keep runtime and schema aligned
  DATABASE_ENV: DatabaseEnvSchema.optional(),

  // DB URL used by CI/tests and tooling (optional here; some tools may not need it)
  DATABASE_URL: z.string().url().optional(),
  // Common build/tooling values
  NODE_ENV: z
    .enum(ENVIRONMENTS)
    .default(process.env.NODE_ENV === "test" ? "test" : "development"),

  // Port commonly used in CI runs; allow overriding
  PORT: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => coercePort(v, DEFAULT_PORT)),

  // Backwards compatibility for older seeding scripts
  SEED_RESET: z.string().optional(),

  // Present in env files; not all tooling needs it, so keep optional
  SESSION_SECRET: z.string().optional(),
});

const parsed = nodeToolingEnvSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.flatten().fieldErrors;
  throw new Error(
    `Invalid build/tooling environment variables. See details:\n${JSON.stringify(details, null, 2)}`,
  );
}

const data = parsed.data;

// Resolve environment with DATABASE_ENV preferred over NODE_ENV, using shared helper
const DATABASE_ENV_INTERNAL: DatabaseEnv = deriveDatabaseEnv(
  process.env.DATABASE_ENV,
  data.NODE_ENV,
);

// Resolve PORT (already coerced in transform with default)
const PORT_INTERNAL = data.PORT;

// Resolve Cypress base URL (fallback to localhost:PORT)
const CYPRESS_BASE_URL_INTERNAL =
  data.CYPRESS_BASE_URL ?? `http://localhost:${PORT_INTERNAL}`;

// Named exports for convenient imports in tooling files
export const NODE_ENV: typeof data.NODE_ENV = data.NODE_ENV;
export const DATABASE_ENV: DatabaseEnv = DATABASE_ENV_INTERNAL;
export const DATABASE_URL: typeof data.DATABASE_URL = data.DATABASE_URL;
export const PORT: number = PORT_INTERNAL;
export const CYPRESS_BASE_URL: string = CYPRESS_BASE_URL_INTERNAL;
export const SESSION_SECRET: typeof data.SESSION_SECRET = data.SESSION_SECRET;
export const SEED_RESET: typeof data.SEED_RESET = data.SEED_RESET;
