/** biome-ignore-all lint/correctness/noProcessGlobal: <env config file> */
/** biome-ignore-all lint/style/noProcessEnv: <env config file> */

import "server-only";
import { z } from "zod";

/**
 * @file Server-only environment configuration for Next.js runtime
 * - Validates and exposes secrets
 * - Shared env values are imported from `@/shared/config/env-shared`
 */

const NON_EMPTY_STRING_MIN_LENGTH = 1 as const;

const ServerEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid URL")
    .min(NON_EMPTY_STRING_MIN_LENGTH),

  SESSION_AUDIENCE: z.string().min(NON_EMPTY_STRING_MIN_LENGTH),

  SESSION_ISSUER: z.string().min(NON_EMPTY_STRING_MIN_LENGTH),

  SESSION_SECRET: z
    .string()
    .min(NON_EMPTY_STRING_MIN_LENGTH, "SESSION_SECRET cannot be empty"),
});

let cachedServerEnv: Readonly<z.infer<typeof ServerEnvSchema>> | undefined;

function parseServerEnv() {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  const parsed = ServerEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    throw new Error(
      `Invalid or missing server environment variables. See details:\n${JSON.stringify(
        details,
        null,
        2,
      )}`,
    );
  }

  cachedServerEnv = Object.freeze(parsed.data);
  return cachedServerEnv;
}

/** Export validated server-only variables */
const env = parseServerEnv();

export const DATABASE_URL = env.DATABASE_URL;
export const SESSION_SECRET = env.SESSION_SECRET;
export const SESSION_ISSUER = env.SESSION_ISSUER;
export const SESSION_AUDIENCE = env.SESSION_AUDIENCE;
