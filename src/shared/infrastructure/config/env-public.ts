// src/shared/config/env-public.ts
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
} from "@/shared/infrastructure/config/env-schemas";

/**
 * Check if process.env is available (server-side).
 */
function hasProcessEnv(): boolean {
  return typeof process !== "undefined" && typeof process.env !== "undefined";
}

/**
 * Resolve and validate NEXT_PUBLIC_NODE_ENV.
 * - Requires NEXT_PUBLIC_NODE_ENV to be set and valid ("development" | "test" | "production")
 */
export function getPublicNodeEnv(): NodeEnvironment {
  if (!hasProcessEnv()) {
    throw new Error("process.env is not available in this environment");
  }
  const raw = process.env.NEXT_PUBLIC_NODE_ENV;
  if (!raw) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_NODE_ENV",
    );
  }
  const result = NodeEnvironmentSchema.safeParse(raw.trim());
  if (!result.success) {
    throw new Error(`Invalid NEXT_PUBLIC_NODE_ENV: ${result.error.message}`);
  }
  return result.data;
}

/**
 * Resolve and validate NEXT_PUBLIC_LOG_LEVEL.
 * - Requires NEXT_PUBLIC_LOG_LEVEL to be set and valid
 */
export function getPublicLogLevel(): LogLevel {
  if (!hasProcessEnv()) {
    throw new Error("process.env is not available in this environment");
  }
  const raw = process.env.NEXT_PUBLIC_LOG_LEVEL;
  if (!raw) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_LOG_LEVEL",
    );
  }
  const result = LogLevelSchema.safeParse(raw.trim());
  if (!result.success) {
    throw new Error(`Invalid NEXT_PUBLIC_LOG_LEVEL: ${result.error.message}`);
  }
  return result.data;
}

/**
 * Get runtime NODE_ENV (server-side only).
 * Falls back to NEXT_PUBLIC_NODE_ENV for universal access.
 */
export function getRuntimeNodeEnv(): NodeEnvironment {
  if (hasProcessEnv() && process.env.NODE_ENV) {
    const result = NodeEnvironmentSchema.safeParse(process.env.NODE_ENV);
    if (result.success) {
      return result.data;
    }
  }
  return getPublicNodeEnv();
}

/* -------------------------------------------------------------------------------------------------
 *  Flags (runtime functions)
 * -----------------------------------------------------------------------------------------------*/

export function isPublicDev(): boolean {
  return getPublicNodeEnv() === "development";
}
export function isPublicTest(): boolean {
  return getPublicNodeEnv() === "test";
}
export function isPublicProd(): boolean {
  return getPublicNodeEnv() === "production";
}
