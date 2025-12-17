/** biome-ignore-all lint/correctness/noProcessGlobal: <env config file> */
/** biome-ignore-all lint/style/noProcessEnv: <env config file> */

/**
 * @file Shared environment utilities
 * - Canonical handling of NODE_ENV, DATABASE_ENV, LOG_LEVEL
 * - Safe for universal import (client/server)
 */

import { getPublicNodeEnvResult } from "@/shared/config/env-public";
import {
  type DatabaseEnvironment,
  DatabaseEnvironmentSchema,
  type LogLevel,
  LogLevelSchema,
  type NodeEnvironment,
  NodeEnvironmentSchema,
} from "@/shared/config/env-schemas";
import { getEnvVariable } from "@/shared/config/env-utils";
import type { AppError } from "@/shared/errors/core/app-error";
import { makeValidationError } from "@/shared/errors/factories/app-error";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/* -------------------------------------------------------------------------------------------------
 *  Environment Accessors (no module-level caching)
 * -----------------------------------------------------------------------------------------------*/

/**
 * Resolve and validate NODE_ENV as a Result.
 * - On client: use NEXT_PUBLIC_NODE_ENV (validated by env-public)
 * - On server: require NODE_ENV to be set and valid
 *
 * @returns A Result containing the validated NodeEnvironment or an AppError.
 */
export function getNodeEnvResult(): Result<NodeEnvironment, AppError> {
  if (typeof window !== "undefined") {
    return getPublicNodeEnvResult();
  }
  const raw = getEnvVariable("NODE_ENV");
  const result = NodeEnvironmentSchema.safeParse(raw);
  if (!result.success) {
    return Err(
      makeValidationError({
        message: `Invalid NODE_ENV value "${raw}": ${result.error.message}`,
        metadata: { raw, zodError: result.error.issues },
      }),
    );
  }
  return Ok(result.data);
}

/**
 * Resolve and validate NODE_ENV.
 * - On client: use NEXT_PUBLIC_NODE_ENV (validated by env-public)
 * - On server: require NODE_ENV to be set and valid
 *
 * @returns The validated NodeEnvironment.
 * @throws {Error} When NODE_ENV is invalid.
 */
export function getNodeEnv(): NodeEnvironment {
  const result = getNodeEnvResult();
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error.message);
}

/**
 * Resolve and validate DATABASE_ENV as a Result.
 *
 * @returns A Result containing the validated DatabaseEnvironment or an AppError.
 */
export function getDatabaseEnvResult(): Result<DatabaseEnvironment, AppError> {
  const raw = getEnvVariable("DATABASE_ENV");
  const result = DatabaseEnvironmentSchema.safeParse(raw);
  if (!result.success) {
    return Err(
      makeValidationError({
        message: `Invalid DATABASE_ENV value "${raw}": ${result.error.message}`,
        metadata: { raw, zodError: result.error.issues },
      }),
    );
  }
  return Ok(result.data);
}

/**
 * Resolve and validate DATABASE_ENV.
 * - Requires DATABASE_ENV to be set and valid
 *
 * @returns The validated DatabaseEnvironment.
 * @throws {Error} When DATABASE_ENV is invalid.
 */
export function getDatabaseEnv(): DatabaseEnvironment {
  const result = getDatabaseEnvResult();
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error.message);
}

/**
 * Get effective LOG_LEVEL as a Result.
 *
 * @returns A Result containing the validated LogLevel or an AppError.
 */
export function getLogLevelResult(): Result<LogLevel, AppError> {
  const raw = getEnvVariable("LOG_LEVEL");
  const result = LogLevelSchema.safeParse(raw);
  if (!result.success) {
    return Err(
      makeValidationError({
        message: `Invalid LOG_LEVEL value "${raw}": ${result.error.message}`,
        metadata: { raw, zodError: result.error.issues },
      }),
    );
  }
  return Ok(result.data);
}

/**
 * Get effective LOG_LEVEL.
 * - Requires LOG_LEVEL to be set and valid
 *
 * @returns The validated LogLevel.
 * @throws {Error} When LOG_LEVEL is invalid.
 */
export function getLogLevel(): LogLevel {
  const result = getLogLevelResult();
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error.message);
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
