// File: env-shared.ts
/** biome-ignore-all lint/correctness/noProcessGlobal: <centralized env file> */
/** biome-ignore-all lint/style/noProcessEnv: <centralized env file> */
import { z } from "zod";

export const toLower = (value: string | undefined, fallback: string): string =>
  (value ?? fallback).toLowerCase();

export const ENVIRONMENTS = ["development", "test", "production"] as const;

export type DatabaseEnv = (typeof ENVIRONMENTS)[number];
export const DatabaseEnvEnum = z.enum(ENVIRONMENTS);

export type NodeEnv = (typeof ENVIRONMENTS)[number];
export const NodeEnvSchema = z.enum(ENVIRONMENTS);

/**
 * Resolve and validate NODE_ENV in a safe, centralized way.
 * - Lowercases the value
 * - Falls back to "development" if invalid or missing
 * - Cached to avoid repeated parsing
 */
export let CACHED_NODE_ENV: NodeEnv | undefined;
export function getNodeEnv(): NodeEnv {
  if (CACHED_NODE_ENV) {
    return CACHED_NODE_ENV;
  }
  const raw = toLower(process.env.NODE_ENV, "development");
  const parsed = NodeEnvSchema.safeParse(raw);
  CACHED_NODE_ENV = parsed.success ? parsed.data : "development";
  return CACHED_NODE_ENV;
}

/**
 * Resolve and validate DATABASE_ENV (runtime environment used by the database/config).
 * - Lowercases the value
 * - Falls back to NODE_ENV if missing
 * - Falls back to "development" if still invalid
 * - Cached to avoid repeated parsing
 */
export let CACHED_DATABASE_ENV: DatabaseEnv | undefined;
export function getDatabaseEnv(): DatabaseEnv {
  if (CACHED_DATABASE_ENV) {
    return CACHED_DATABASE_ENV;
  }
  const fallback = getNodeEnv();
  const raw = toLower(process.env.DATABASE_ENV, fallback);
  const parsed = DatabaseEnvEnum.safeParse(raw);
  CACHED_DATABASE_ENV = parsed.success ? parsed.data : "development";
  return CACHED_DATABASE_ENV;
}

/** Convenience flags (explicit types) */
export const IS_DEV: boolean = getNodeEnv() === "development";
export const IS_TEST: boolean = getNodeEnv() === "test";
export const IS_PROD: boolean = getNodeEnv() === "production";

// Testing-only reset to avoid cross-test pollution (no-op in prod code paths)
export function __resetEnvCachesForTests__(): void {
  CACHED_NODE_ENV = undefined;
  CACHED_DATABASE_ENV = undefined;
}
