/** biome-ignore-all lint/correctness/noProcessGlobal: <env config file> */
/** biome-ignore-all lint/style/noProcessEnv: <env config file> */

/**
 * @file Shared environment utilities
 * - Canonical handling of NODE_ENV, DATABASE_ENV, LOG_LEVEL
 * - Uses Pino’s built-in log level support (no duplication)
 * - Safe for universal import (client/server)
 */

import type { Level } from "pino";
import { z } from "zod";

/* -------------------------------------------------------------------------------------------------
 *  🧭 Environment Schemas
 * -----------------------------------------------------------------------------------------------*/

/** Allowed runtime environments. */
export const ENVIRONMENTS = ["development", "test", "production"] as const;

/** Shared Zod schema + inferred type. */
export const EnvironmentSchema = z.enum(ENVIRONMENTS);
export type Environment = z.infer<typeof EnvironmentSchema>;

/* -------------------------------------------------------------------------------------------------
 *  🔧 Helpers
 * -----------------------------------------------------------------------------------------------*/

/** Normalize env strings safely with lowercase fallback. */
function toLower(value: string | undefined, fallback: string): string {
  return (value ?? fallback).toLowerCase();
}

/* -------------------------------------------------------------------------------------------------
 *  🧠 Cached State
 * -----------------------------------------------------------------------------------------------*/

let cachedNodeEnv: Environment | undefined;
let cachedDatabaseEnv: Environment | undefined;
let cachedLogLevel: Level | undefined;

/* -------------------------------------------------------------------------------------------------
 *  🌍 Environment Accessors
 * -----------------------------------------------------------------------------------------------*/

/**
 * Resolve and validate NODE_ENV.
 * - Always returns one of "development" | "test" | "production"
 * - Defaults to "development" if invalid or missing
 */
export function getNodeEnv(): Environment {
  if (cachedNodeEnv) {
    return cachedNodeEnv;
  }

  const raw = toLower(process.env.NODE_ENV, "development");
  const parsed = EnvironmentSchema.safeParse(raw);
  cachedNodeEnv = parsed.success ? parsed.data : "development";

  return cachedNodeEnv;
}

/**
 * Resolve and validate DATABASE_ENV.
 * - Falls back to NODE_ENV if missing
 * - Defaults to "development" if invalid
 */
export function getDatabaseEnv(): Environment {
  if (cachedDatabaseEnv) {
    return cachedDatabaseEnv;
  }

  const fallback = getNodeEnv();
  const raw = toLower(process.env.databaseEnv, fallback);
  const parsed = EnvironmentSchema.safeParse(raw);
  cachedDatabaseEnv = parsed.success ? parsed.data : "development";

  return cachedDatabaseEnv;
}

/**
 * Get effective LOG_LEVEL.
 * - Defers to process.env.LOG_LEVEL (as Pino expects)
 * - Defaults to "info" in production, "debug" otherwise
 */
export function getLogLevel(): Level {
  if (cachedLogLevel) {
    return cachedLogLevel;
  }

  const fallback: Level = getNodeEnv() === "production" ? "info" : "debug";
  const raw = toLower(process.env.LOG_LEVEL, fallback) as Level;
  cachedLogLevel = raw;

  return cachedLogLevel;
}

/* -------------------------------------------------------------------------------------------------
 *  🧩 Exported Constants & Flags
 * -----------------------------------------------------------------------------------------------*/

export const NODE_ENV: Environment = getNodeEnv();
export const DATABASE_ENV: Environment = getDatabaseEnv();
export const LOG_LEVEL: Level = getLogLevel();

export const IS_DEV = NODE_ENV === "development";
export const IS_TEST = NODE_ENV === "test";
export const IS_PROD = NODE_ENV === "production";

export const IS_DEV_DB = DATABASE_ENV === "development";
export const IS_TEST_DB = DATABASE_ENV === "test";
export const IS_PROD_DB = DATABASE_ENV === "production";

/**
 * Check if current NODE_ENV matches one of the provided values.
 *
 * @example
 * if (isEnv("development", "test")) console.log("Debug logging enabled");
 */
export function isEnv(...envs: Environment[]): boolean {
  return envs.includes(NODE_ENV);
}

/**
 * Reset cached envs — useful in tests to avoid cross-test pollution.
 * (No effect in production.)
 */
export function __resetEnvCachesForTests__(): void {
  cachedNodeEnv = undefined;
  cachedDatabaseEnv = undefined;
  cachedLogLevel = undefined;
}
