import { z } from "zod";
import { getDatabaseEnv, getNodeEnv } from "@/shared/config/env/env-shared";
import { type LogLevel, LogLevelSchema } from "@/shared/logging/log-level";

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_LOG_LEVEL: LogLevelSchema.optional(),
});

/**
 * Parse and validate public (browser-exposed) environment variables.
 * Throws early with a readable error if invalid.
 */
function parsePublicEnv() {
  const parsed = PublicEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    throw new Error(
      `Invalid public environment variables. See details:\n${JSON.stringify(details, null, 2)}`,
    );
  }
  return parsed.data;
}

const PUBLIC_ENV = parsePublicEnv();

/** Effective Node and Database environments derived once and reused. */
const NODE_ENV = getNodeEnv();
const DATABASE_ENV = getDatabaseEnv();

/** Exported, browser-safe values */
export const NEXT_PUBLIC_LOG_LEVEL = PUBLIC_ENV.NEXT_PUBLIC_LOG_LEVEL as
  | LogLevel
  | undefined;

export const IS_PROD: boolean = NODE_ENV === "production";

// If you need to branch client behavior by database environment (non-secret), expose a boolean.
// Keep it minimal to avoid leaking unnecessary config.
export const IS_DB_PROD: boolean = DATABASE_ENV === "production";
