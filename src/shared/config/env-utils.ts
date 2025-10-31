/** biome-ignore-all lint/correctness/noProcessGlobal: <explanation> */
/** biome-ignore-all lint/style/noProcessEnv: <explanation> */
import { logger } from "@/shared/logging/logger.shared";

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
 * Get a required env var value or throw/log a warning.
 */
export function getEnvVariable<K extends EnvVariables>(key: K): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    if (process.env.NODE_ENV !== "production") {
      logger.warn(`⚠️  Missing environment variable: ${key}`);
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
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
 * Validate required environment variables at startup.
 * Throws if any are missing or empty.
 */
export function validateEnv(
  requiredVars: readonly EnvVariables[] = ENV_VARIABLES_TUPLE,
): void {
  const missing: EnvVariables[] = [];

  for (const key of requiredVars) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    for (const key of missing) {
      logger.error(`❌ Missing required environment variable: ${key}`);
    }
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  logger.info("✅ Environment variables validated successfully");
}
