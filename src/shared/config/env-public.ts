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
import type { AppError } from "@/shared/errors/core/app-error";
import {
  makeInfrastructureError,
  makeValidationError,
} from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Check if process.env is available (server-side).
 */
function hasProcessEnv(): boolean {
  return typeof process !== "undefined" && typeof process.env !== "undefined";
}

/**
 * Resolve and validate NEXT_PUBLIC_NODE_ENV as a Result.
 *
 * @returns A Result containing the validated NodeEnvironment or an AppError.
 */
export function getPublicNodeEnvResult(): Result<NodeEnvironment, AppError> {
  if (!hasProcessEnv()) {
    return Err(
      makeInfrastructureError({
        message: "process.env is not available in this environment",
        metadata: {},
      }),
    );
  }
  const raw = process.env.NEXT_PUBLIC_NODE_ENV;
  if (!raw) {
    return Err(
      makeValidationError({
        message: "Missing required environment variable: NEXT_PUBLIC_NODE_ENV",
        metadata: { key: "NEXT_PUBLIC_NODE_ENV" },
      }),
    );
  }
  const result = NodeEnvironmentSchema.safeParse(raw.trim());
  if (!result.success) {
    return Err(
      makeValidationError({
        message: `Invalid NEXT_PUBLIC_NODE_ENV: ${result.error.message}`,
        metadata: { raw, zodError: result.error.issues },
      }),
    );
  }
  return Ok(result.data);
}

/**
 * Resolve and validate NEXT_PUBLIC_NODE_ENV.
 * - Requires NEXT_PUBLIC_NODE_ENV to be set and valid ("development" | "test" | "production")
 *
 * @returns The validated NodeEnvironment.
 * @throws {Error} When NEXT_PUBLIC_NODE_ENV is invalid or missing.
 */
export function getPublicNodeEnv(): NodeEnvironment {
  const result = getPublicNodeEnvResult();
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error.message);
}

/**
 * Resolve and validate NEXT_PUBLIC_LOG_LEVEL as a Result.
 *
 * @returns A Result containing the validated LogLevel or an AppError.
 */
export function getPublicLogLevelResult(): Result<LogLevel, AppError> {
  if (!hasProcessEnv()) {
    return Err(
      makeInfrastructureError({
        message: "process.env is not available in this environment",
        metadata: {},
      }),
    );
  }
  const raw = process.env.NEXT_PUBLIC_LOG_LEVEL;
  if (!raw) {
    return Err(
      makeValidationError({
        message: "Missing required environment variable: NEXT_PUBLIC_LOG_LEVEL",
        metadata: { key: "NEXT_PUBLIC_LOG_LEVEL" },
      }),
    );
  }
  const result = LogLevelSchema.safeParse(raw.trim());
  if (!result.success) {
    return Err(
      makeValidationError({
        message: `Invalid NEXT_PUBLIC_LOG_LEVEL: ${result.error.message}`,
        metadata: { raw, zodError: result.error.issues },
      }),
    );
  }
  return Ok(result.data);
}

/**
 * Resolve and validate NEXT_PUBLIC_LOG_LEVEL.
 * - Requires NEXT_PUBLIC_LOG_LEVEL to be set and valid
 *
 * @returns The validated LogLevel.
 * @throws {Error} When NEXT_PUBLIC_LOG_LEVEL is invalid or missing.
 */
export function getPublicLogLevel(): LogLevel {
  const result = getPublicLogLevelResult();
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error.message);
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
