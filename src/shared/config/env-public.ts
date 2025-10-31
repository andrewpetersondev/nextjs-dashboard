/** biome-ignore-all lint/correctness/noProcessGlobal: <env config file> */
/** biome-ignore-all lint/style/noProcessEnv: <env config file> */

/**
 * @file Public environment configuration for Next.js build-time/client-exposed vars
 * - Validates and exposes non-sensitive values
 * - Safe for universal import (client/server)
 */

import {
  type LogLevel,
  LogLevelSchema,
  type NodeEnvironment,
  NodeEnvironmentSchema,
} from "@/shared/config/env-schemas";

/* -------------------------------------------------------------------------------------------------
 *  🧠 Cached State
 * -----------------------------------------------------------------------------------------------*/

let cachedPublicNodeEnv: NodeEnvironment | undefined;
let cachedPublicLogLevel: LogLevel | undefined;

/* -------------------------------------------------------------------------------------------------
 *  🌍 Environment Accessors
 * -----------------------------------------------------------------------------------------------*/

/**
 * Resolve and validate NEXT_PUBLIC_NODE_ENV.
 * - Requires NEXT_PUBLIC_NODE_ENV to be set and valid ("development" | "test" | "production")
 */
export function getPublicNodeEnv(): NodeEnvironment {
  if (cachedPublicNodeEnv) {
    return cachedPublicNodeEnv;
  }
  const raw = process.env.NEXT_PUBLIC_NODE_ENV;
  if (!raw) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_NODE_ENV",
    );
  }
  cachedPublicNodeEnv = NodeEnvironmentSchema.parse(raw.trim());
  return cachedPublicNodeEnv;
}

/**
 * Resolve and validate NEXT_PUBLIC_LOG_LEVEL.
 * - Requires NEXT_PUBLIC_LOG_LEVEL to be set and valid
 */
export function getPublicLogLevel(): LogLevel {
  if (cachedPublicLogLevel) {
    return cachedPublicLogLevel;
  }
  const raw = process.env.NEXT_PUBLIC_LOG_LEVEL;
  if (!raw) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_LOG_LEVEL",
    );
  }
  cachedPublicLogLevel = LogLevelSchema.parse(raw.trim());
  return cachedPublicLogLevel;
}

/* -------------------------------------------------------------------------------------------------
 *  🧩 Exported Constants & Flags
 * -----------------------------------------------------------------------------------------------*/

export const NEXT_PUBLIC_NODE_ENV: NodeEnvironment = getPublicNodeEnv();
export const NEXT_PUBLIC_LOG_LEVEL: LogLevel = getPublicLogLevel();

export const IS_PUBLIC_DEV = NEXT_PUBLIC_NODE_ENV === "development";
export const IS_PUBLIC_TEST = NEXT_PUBLIC_NODE_ENV === "test";
export const IS_PUBLIC_PROD = NEXT_PUBLIC_NODE_ENV === "production";

/**
 * Reset cached public envs — useful in tests to avoid cross-test pollution.
 * (No effect in production.)
 */
export function __resetPublicEnvCachesForTests__(): void {
  cachedPublicNodeEnv = undefined;
  cachedPublicLogLevel = undefined;
}
