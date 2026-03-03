import type { AppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";
import type { Result } from "@/shared/core/result/result.dto";

/**
 * Type-safe env accessor keys.
 */
const ENV_VARIABLES_TUPLE = [
  "AUTH_BCRYPT_SALT_ROUNDS",
  "CYPRESS_BASE_URL",
  "DATABASE_ENV",
  "DATABASE_URL",
  "LOG_LEVEL",
  "NEXT_PUBLIC_LOG_LEVEL",
  "NEXT_PUBLIC_NODE_ENV",
  "NODE_ENV",
  "SESSION_AUDIENCE",
  "SESSION_ISSUER",
  "SESSION_SECRET",
] as const;

type EnvVariables = (typeof ENV_VARIABLES_TUPLE)[number];

/**
 * Get a required env var value as a Result.
 *
 * @param key - The environment variable key to retrieve.
 * @returns A Result containing the trimmed string value or an AppError if missing/empty.
 */
function getEnvVariableResult<K extends EnvVariables>(
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
// biome-ignore lint/style/useExportsLast: fix at some point
export function getEnvVariable<K extends EnvVariables>(key: K): string {
  const result = getEnvVariableResult(key);
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error.message);
}

/**
 * Validate required environment variables as a Result.
 *
 * @param requiredVars - Array of environment variable keys to validate.
 * @returns A Result containing void on success or an AppError listing missing variables.
 */
function validateEnvResult(
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
function _validateEnv(
  requiredVars: readonly EnvVariables[] = ENV_VARIABLES_TUPLE,
): void {
  const result = validateEnvResult(requiredVars);
  if (!result.ok) {
    throw new Error(result.error.message);
  }
}

/**
 * Get the current process ID.
 *
 * @remarks
 * Server-only by placement. Returns `undefined` if `process` is not available.
 */
export function getProcessId(): number | undefined {
  return typeof process !== "undefined" ? process.pid : undefined;
}
