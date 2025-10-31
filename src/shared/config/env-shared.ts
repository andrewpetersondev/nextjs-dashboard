/** biome-ignore-all lint/correctness/noProcessGlobal: <env config file> */
/** biome-ignore-all lint/style/noProcessEnv: <env config file> */

/**
 * @file Shared environment utilities
 * - Canonical handling of NODE_ENV, DATABASE_ENV, LOG_LEVEL
 * - Uses Pino’s built-in log level support (no duplication)
 * - Safe for universal import (client/server)
 */

import {
  type DatabaseEnvironment,
  DatabaseEnvironmentSchema,
  LogLevelSchema,
  type NodeEnvironment,
  NodeEnvironmentSchema,
} from "@/shared/config/env-schemas";
import type { LogLevel } from "@/shared/logging/logger.shared";

/* -------------------------------------------------------------------------------------------------
 *  🔧 Helpers
 * -----------------------------------------------------------------------------------------------*/

/**
 * Get a required env var value or throw a clear error.
 * Use this for secrets/values that must be present at runtime.
 */
export function getRequiredEnv(name: string): string {
  const val = process.env[name];
  if (val === undefined || val.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val.trim();
}

/* -------------------------------------------------------------------------------------------------
 *  🧠 Cached State
 * -----------------------------------------------------------------------------------------------*/

let cachedNodeEnv: NodeEnvironment | undefined;
let cachedDatabaseEnv: DatabaseEnvironment | undefined;
let cachedLogLevel: LogLevel | undefined;

/* -------------------------------------------------------------------------------------------------
 *  🌍 Environment Accessors
 * -----------------------------------------------------------------------------------------------*/

/**
 * Resolve and validate NODE_ENV.
 * - Requires NODE_ENV to be set and valid ("development" | "test" | "production")
 */
export function getNodeEnv(): NodeEnvironment {
  if (cachedNodeEnv) {
    return cachedNodeEnv;
  }
  const raw = getRequiredEnv("NODE_ENV");
  cachedNodeEnv = NodeEnvironmentSchema.parse(raw);
  return cachedNodeEnv;
}

/**
 * Resolve and validate DATABASE_ENV.
 * - Requires DATABASE_ENV to be set and valid
 */
export function getDatabaseEnv(): DatabaseEnvironment {
  if (cachedDatabaseEnv) {
    return cachedDatabaseEnv;
  }
  const raw = getRequiredEnv("DATABASE_ENV");
  cachedDatabaseEnv = DatabaseEnvironmentSchema.parse(raw);
  return cachedDatabaseEnv;
}

/**
 * Get effective LOG_LEVEL.
 * - Requires LOG_LEVEL to be set and valid
 */
export function getLogLevel(): LogLevel {
  if (cachedLogLevel) {
    return cachedLogLevel;
  }
  const raw = getRequiredEnv("LOG_LEVEL");
  cachedLogLevel = LogLevelSchema.parse(raw);
  return cachedLogLevel;
}

/* -------------------------------------------------------------------------------------------------
 *  🧩 Exported Constants & Flags
 * -----------------------------------------------------------------------------------------------*/

export const NODE_ENV: NodeEnvironment = getNodeEnv();
export const DATABASE_ENV: DatabaseEnvironment = getDatabaseEnv();
export const LOG_LEVEL: LogLevel = getLogLevel();

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
export function isEnv(...envs: NodeEnvironment[]): boolean {
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
