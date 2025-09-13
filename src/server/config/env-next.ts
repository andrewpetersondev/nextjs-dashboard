import "server-only";

import { z } from "zod";
import {
  type DatabaseEnv,
  DatabaseEnvEnum,
} from "@/shared/config/env/env-shared";
import { type LogLevel, LogLevelSchema } from "@/shared/logging/log-level";

const NON_EMPTY_STRING_MIN_LENGTH = 1 as const;

const envSchema = z.object({
  DATABASE_ENV: DatabaseEnvEnum,
  DATABASE_URL: z.url(),
  LOG_LEVEL: LogLevelSchema.optional(),
  SESSION_AUDIENCE: z.string().min(NON_EMPTY_STRING_MIN_LENGTH).optional(),
  SESSION_ISSUER: z.string().min(NON_EMPTY_STRING_MIN_LENGTH).optional(),
  SESSION_SECRET: z
    .string()
    .min(NON_EMPTY_STRING_MIN_LENGTH, "SESSION_SECRET cannot be empty"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.flatten().fieldErrors;
  throw new Error(
    `Invalid or missing environment variables. See details:\n${JSON.stringify(details, null, 2)}`,
  );
}

export const SESSION_SECRET = parsed.data.SESSION_SECRET;
export const SESSION_ISSUER: string | undefined = parsed.data.SESSION_ISSUER;
export const SESSION_AUDIENCE: string | undefined =
  parsed.data.SESSION_AUDIENCE;
export const DATABASE_URL = parsed.data.DATABASE_URL;
export const DATABASE_ENV: DatabaseEnv = parsed.data.DATABASE_ENV;
export const LOG_LEVEL: LogLevel | undefined = parsed.data.LOG_LEVEL;

//Environment-derived flags
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
