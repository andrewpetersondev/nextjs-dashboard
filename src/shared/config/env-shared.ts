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

export const ENVIRONMENTS = ["development", "test", "production"] as const;
export type DatabaseEnv = (typeof ENVIRONMENTS)[number];

export const DatabaseEnvSchema = z.enum(ENVIRONMENTS);

/**
 * Prefer DATABASE_ENV; otherwise fall back to NODE_ENV.
 * Defaults to "development" when unknown or undefined.
 */
export function deriveDatabaseEnv(
  databaseEnv?: string,
  nodeEnv?: string,
): DatabaseEnv {
  const normalized = (databaseEnv ?? nodeEnv ?? "development").toLowerCase();
  return ENVIRONMENTS.includes(normalized as DatabaseEnv)
    ? (normalized as DatabaseEnv)
    : "development";
}

/**
 * Coerce a port value to a valid number with a fallback.
 */
export function coercePort(value: unknown, fallback = 3100): number {
  const n = Number(value);
  if (Number.isInteger(n) && n >= 1 && n <= 65_535) {
    return n;
  }
  return fallback;
}
