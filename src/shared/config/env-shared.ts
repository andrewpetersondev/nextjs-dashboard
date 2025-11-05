// src/shared/config/env-shared.ts
/** biome-ignore-all lint/correctness/noProcessGlobal: <env config file> */
/** biome-ignore-all lint/style/noProcessEnv: <env config file> */

/**
 * @file Shared environment utilities
 * - Canonical handling of NODE_ENV, DATABASE_ENV, LOG_LEVEL
 * - Safe for universal import (client/server)
 */

import {
  type DatabaseEnvironment,
  DatabaseEnvironmentSchema,
  type LogLevel,
  LogLevelSchema,
  type NodeEnvironment,
  NodeEnvironmentSchema,
} from "@/shared/config/env-schemas";
import { getEnvVariable } from "@/shared/config/env-utils";

/* -------------------------------------------------------------------------------------------------
 *  Environment Accessors (no module-level caching)
 * -----------------------------------------------------------------------------------------------*/

/**
 * Resolve and validate NODE_ENV.
 * - Requires NODE_ENV to be set and valid ("development" | "test" | "production")
 */
export function getNodeEnv(): NodeEnvironment {
  const raw = getEnvVariable("NODE_ENV");
  const result = NodeEnvironmentSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid NODE_ENV value "${raw}": ${result.error.message}`);
  }
  return result.data;
}

/**
 * Resolve and validate DATABASE_ENV.
 * - Requires DATABASE_ENV to be set and valid
 */
export function getDatabaseEnv(): DatabaseEnvironment {
  const raw = getEnvVariable("DATABASE_ENV");
  const result = DatabaseEnvironmentSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid DATABASE_ENV value "${raw}": ${result.error.message}`,
    );
  }
  return result.data;
}

/**
 * Get effective LOG_LEVEL.
 * - Requires LOG_LEVEL to be set and valid
 */
export function getLogLevel(): LogLevel {
  const raw = getEnvVariable("LOG_LEVEL");
  const result = LogLevelSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid LOG_LEVEL value "${raw}": ${result.error.message}`,
    );
  }
  return result.data;
}

/* -------------------------------------------------------------------------------------------------
 *  Runtime flag helpers
 * -----------------------------------------------------------------------------------------------*/

export function isDev(): boolean {
  return getNodeEnv() === "development";
}
export function isTest(): boolean {
  return getNodeEnv() === "test";
}
export function isProd(): boolean {
  return getNodeEnv() === "production";
}

export function isDevDb(): boolean {
  return getDatabaseEnv() === "development";
}
export function isTestDb(): boolean {
  return getDatabaseEnv() === "test";
}
export function isProdDb(): boolean {
  return getDatabaseEnv() === "production";
}

/**
 * Check if current NODE_ENV matches one of the provided values.
 *
 * @example
 * if (isEnv("development", "test")) console.log("Debug logging enabled");
 */
export function isEnv(...envs: NodeEnvironment[]): boolean {
  return envs.includes(getNodeEnv());
}
