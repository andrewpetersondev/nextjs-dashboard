// File: env-next.ts
/** biome-ignore-all lint/correctness/noProcessGlobal: <centralized env file> */
/** biome-ignore-all lint/style/noProcessEnv: <centralized env file> */
import "server-only";
import { z } from "zod";
import {
  type DatabaseEnv,
  DatabaseEnvEnum,
  getDatabaseEnv,
  getNodeEnv,
} from "@/shared/config/env-shared";
import { type LogLevel, LogLevelSchema } from "@/shared/logging/log-level";

const NON_EMPTY_STRING_MIN_LENGTH = 1 as const;

// Local helpers
const pickEnv = (src: NodeJS.ProcessEnv): Record<string, unknown> =>
  ({
    DATABASE_ENV: src.DATABASE_ENV,
    DATABASE_URL: src.DATABASE_URL,
    LOG_LEVEL: src.LOG_LEVEL,
    SESSION_AUDIENCE: src.SESSION_AUDIENCE,
    SESSION_ISSUER: src.SESSION_ISSUER,
    SESSION_SECRET: src.SESSION_SECRET,
  }) as const;

const envSchema = z.object({
  DATABASE_ENV: DatabaseEnvEnum,
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: LogLevelSchema.optional(),
  SESSION_AUDIENCE: z.string().min(NON_EMPTY_STRING_MIN_LENGTH).optional(),
  SESSION_ISSUER: z.string().min(NON_EMPTY_STRING_MIN_LENGTH).optional(),
  SESSION_SECRET: z
    .string()
    .min(NON_EMPTY_STRING_MIN_LENGTH, "SESSION_SECRET cannot be empty"),
});

type EnvShape = z.infer<typeof envSchema>;

let CACHED_ENV: Readonly<EnvShape> | undefined;

function parseEnv(): Readonly<EnvShape> {
  if (CACHED_ENV) {
    return CACHED_ENV;
  }
  // Prefer centralized fallback rules via getDatabaseEnv for DATABASE_ENV
  const base = pickEnv(process.env);
  const normalized = {
    ...base,
    DATABASE_ENV:
      typeof base.DATABASE_ENV === "string"
        ? base.DATABASE_ENV
        : getDatabaseEnv(),
  };
  const parsed = envSchema.safeParse(normalized);
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    throw new Error(
      `Invalid or missing environment variables. See details:\n${JSON.stringify(details, null, 2)}`,
    );
  }
  CACHED_ENV = Object.freeze(parsed.data);
  return CACHED_ENV;
}

const env = parseEnv();

export const SESSION_SECRET: string = env.SESSION_SECRET;
export const SESSION_ISSUER: string | undefined = env.SESSION_ISSUER;
export const SESSION_AUDIENCE: string | undefined = env.SESSION_AUDIENCE;
export const DATABASE_URL: string = env.DATABASE_URL;
export const DATABASE_ENV: DatabaseEnv = env.DATABASE_ENV;
export const LOG_LEVEL: LogLevel | undefined = env.LOG_LEVEL;

// Environment-derived flags
export const IS_PRODUCTION: boolean = getNodeEnv() === "production";

// Testing-only reset. Safe to call in tests to re-parse env.
export function __resetServerEnvCacheForTests__(): void {
  CACHED_ENV = undefined;
}
