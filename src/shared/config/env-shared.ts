/**
 * File: env-shared.ts
 * Purpose: Single source of truth for environment names and tiny, runtime-agnostic helpers.
 *
 * Scope and boundaries:
 * - Safe to import from both:
 *   - Next.js server runtime code
 *   - Node-only/CI tooling (scripts, cypress tasks, next.config.ts)
 * - Not intended for client/browser components (avoid importing from client code).
 * - Must remain dependency-free from framework-specific modules; keep helpers pure.
 *
 * Exports:
 * - ENVIRONMENTS: tuple of allowed environment names
 * - DatabaseEnv: derived union type
 * - DatabaseEnvSchema: zod enum aligned to ENVIRONMENTS
 * - deriveDatabaseEnv(): selects DATABASE_ENV, falling back to NODE_ENV, defaults to "development"
 * - coercePort(): coerces unknown to a valid port with fallback
 *
 * Typical consumers:
 * - node-only/env-node.ts
 * - src/server/config/env-next.ts
 */

import { z } from "zod";

export const MAX_PORT = 65_535;
export const MIN_PORT = 1;
export const DEFAULT_PORT = 3100;

// Standardized list of valid environment names.
export const ENVIRONMENTS = ["development", "test", "production"] as const;

// Type-safe union of valid environment names.
export type DatabaseEnv = (typeof ENVIRONMENTS)[number];

export const DatabaseEnvEnum = z.enum(ENVIRONMENTS);

/**
 * Prefer DATABASE_ENV; otherwise use NODE_ENV.
 * Throws when neither is provided nor when the value is not valid.
 */
export function deriveDatabaseEnv(
  databaseEnv?: string,
  nodeEnv?: string,
): DatabaseEnv {
  const candidate = databaseEnv ?? nodeEnv;

  if (!candidate) {
    throw new Error(
      `deriveDatabaseEnv: missing environment. Set DATABASE_ENV or NODE_ENV to one of: ${ENVIRONMENTS.join(
        ", ",
      )}`,
    );
  }

  const normalized = candidate.toLowerCase();

  if (ENVIRONMENTS.includes(normalized as DatabaseEnv)) {
    return normalized as DatabaseEnv;
  }

  throw new Error(
    `deriveDatabaseEnv: invalid environment "${candidate}". Allowed values: ${ENVIRONMENTS.join(
      ", ",
    )}`,
  );
}

/**
 * Coerce a port value to a valid number with a fallback.
 */
export function coercePort(value: unknown, fallback = DEFAULT_PORT): number {
  const n = Number(value);
  if (Number.isInteger(n) && n >= MIN_PORT && n <= MAX_PORT) {
    return n;
  }
  return fallback;
}
