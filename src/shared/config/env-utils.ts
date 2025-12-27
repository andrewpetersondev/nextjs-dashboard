/** biome-ignore-all lint/correctness/noProcessGlobal: <usage in env config is acceptable> */
/** biome-ignore-all lint/style/noProcessEnv: <usage in env config is acceptable> */

import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";
import { Err, Ok } from "@/shared/results/result";
import type { Result } from "@/shared/results/result.types";

/**
 * Type-safe env accessor.
 */
const ENV_VARIABLES_TUPLE = [
  "NODE_ENV",
  "DATABASE_ENV",
  "LOG_LEVEL",
  "DATABASE_URL",
  "SESSION_SECRET",
  "SESSION_ISSUER",
  "SESSION_AUDIENCE",
  "NEXT_PUBLIC_NODE_ENV",
  "NEXT_PUBLIC_LOG_LEVEL",
  "CYPRESS_BASE_URL",
] as const;
export type EnvVariables = (typeof ENV_VARIABLES_TUPLE)[number];

/**
 * Get a required env var value as a Result.
 *
 * @param key - The environment variable key to retrieve.
 * @returns A Result containing the trimmed string value or an AppError if missing/empty.
 */
export function getEnvVariableResult<K extends EnvVariables>(
  key: K,
): Result<string, AppError> {
  console.log(`Retrieving env var: ${key}`);
  const value = process.env[key];
  if (!value || value.trim() === "") {
    console.log(`Env var ${key} is missing or empty`);
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "Variable is undefined or empty string",
        message: `Missing required environment variable: ${key}`,
        metadata: {
          fieldErrors: { [key]: ["Environment variable is required"] },
        },
      }),
    );
  }
  return Ok(value.trim());
}

/**
 * Get a required env var value or throw.
 *
 * @param key - The environment variable key to retrieve.
 * @returns The trimmed string value.
 * @throws {Error} When the environment variable is missing or empty.
 */
export function getEnvVariable<K extends EnvVariables>(key: K): string {
  const result = getEnvVariableResult(key);
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error.message);
}

/**
 * Map UPPER_SNAKE_CASE env vars to camelCase keys.
 * - Fully type-safe
 * - No defaults or fallbacks
 * - Returns a readonly object
 */
export function mapEnvVars<const T extends Record<string, EnvVariables>>(
  mapping: T,
): Readonly<{ [K in keyof T]: string }> {
  const entries = Object.entries(mapping).map(([camelKey, envKey]) => {
    return [camelKey, getEnvVariable(envKey)];
  });
  return Object.freeze(Object.fromEntries(entries)) as Readonly<{
    [K in keyof T]: string;
  }>;
}

/**
 * Validate required environment variables as a Result.
 *
 * @param requiredVars - Array of environment variable keys to validate.
 * @returns A Result containing void on success or an AppError listing missing variables.
 */
export function validateEnvResult(
  requiredVars: readonly EnvVariables[] = ENV_VARIABLES_TUPLE,
): Result<void, AppError> {
  const missing: EnvVariables[] = [];
  for (const key of requiredVars) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(", ")}`;
    console.error(`❌ ${errorMessage}`);
    return Err(
      makeAppError(APP_ERROR_KEYS.validation, {
        cause: "Startup validation failed",
        message: errorMessage,
        metadata: {
          formErrors: [errorMessage],
        },
      }),
    );
  }
  console.info("✅ Environment variables validated successfully");
  return Ok(undefined);
}

/**
 * Validate required environment variables at startup.
 * Throws if any are missing or empty.
 *
 * @param requiredVars - Array of environment variable keys to validate.
 * @throws {Error} When any required environment variables are missing or empty.
 */
export function validateEnv(
  requiredVars: readonly EnvVariables[] = ENV_VARIABLES_TUPLE,
): void {
  const result = validateEnvResult(requiredVars);
  if (!result.ok) {
    throw new Error(result.error.message);
  }
}

/**
 * Get the current process ID.
 * Safe to use in both server and client contexts (returns undefined on client).
 */
export function getProcessId(): number | undefined {
  return typeof process !== "undefined" ? process.pid : undefined;
}
