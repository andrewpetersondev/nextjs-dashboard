import { getPublicNodeEnvResult } from "@/shared/core/config/env-public";
import {
  type DatabaseEnvironment,
  DatabaseEnvironmentSchema,
  type LogLevel,
  LogLevelSchema,
  type NodeEnvironment,
  NodeEnvironmentSchema,
} from "@/shared/core/config/env-schemas";
import { getEnvVariable } from "@/shared/core/config/env-utils";
import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { makeAppError } from "@/shared/core/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/results/result";
import type { Result } from "@/shared/core/results/result.types";

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
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: `Invalid NODE_ENV value "${raw}": ${result.error.message}`,
        metadata: {},
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
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: `Invalid DATABASE_ENV value "${raw}": ${result.error.message}`,
        metadata: {},
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
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: `Invalid LOG_LEVEL value "${raw}": ${result.error.message}`,
        metadata: {},
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
