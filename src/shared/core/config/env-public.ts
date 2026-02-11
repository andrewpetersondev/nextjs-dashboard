/**
 * @file Public environment configuration for Next.js build-time/client-exposed vars
 * - Validates and exposes non-sensitive values
 * - Safe for universal import (client/server)
 */

import process from "node:process";
import {
  type LogLevel,
  LogLevelSchema,
  type NodeEnvironment,
  NodeEnvironmentSchema,
} from "@/shared/core/config/env-schemas";
import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { makeAppError } from "@/shared/core/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";

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
      makeAppError(APP_ERROR_KEYS.infrastructure, {
        cause: "",
        message: "process.env is not available in this environment",
        metadata: {},
      }),
    );
  }
  const raw = process.env.NEXT_PUBLIC_NODE_ENV;
  if (!raw) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: "Missing required environment variable: NEXT_PUBLIC_NODE_ENV",
        metadata: {},
      }),
    );
  }
  const result = NodeEnvironmentSchema.safeParse(raw.trim());
  if (!result.success) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: `Invalid NEXT_PUBLIC_NODE_ENV: ${result.error.message}`,
        metadata: {},
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
      makeAppError(APP_ERROR_KEYS.infrastructure, {
        cause: "",
        message: "process.env is not available in this environment",
        metadata: {},
      }),
    );
  }
  const raw = process.env.NEXT_PUBLIC_LOG_LEVEL;
  if (!raw) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: "Missing required environment variable: NEXT_PUBLIC_LOG_LEVEL",
        metadata: {},
      }),
    );
  }
  const result = LogLevelSchema.safeParse(raw.trim());
  if (!result.success) {
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: `Invalid NEXT_PUBLIC_LOG_LEVEL: ${result.error.message}`,
        metadata: {},
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
