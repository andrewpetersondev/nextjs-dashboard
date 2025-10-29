// File: devtools/config/env-node.ts
import { z } from "zod";
import {
  type Environment,
  EnvironmentSchema,
  getDatabaseEnv,
} from "@/shared/config/env-shared";

const MIN_LENGTH = 20;

const nodeToolingEnvSchema = z.object({
  CYPRESS_BASE_URL: z.url().optional(),
  DATABASE_ENV: EnvironmentSchema,
  DATABASE_URL: z.url(),
  SESSION_SECRET: z
    .string()
    .min(MIN_LENGTH, `SESSION_SECRET must be at least ${MIN_LENGTH} chars`),
});

// Merge process.env with normalized DATABASE_ENV fallback
const baseEnv = {
  ...process.env,
  DATABASE_ENV: getDatabaseEnv(),
};

const parsed = nodeToolingEnvSchema.safeParse(baseEnv);

if (!parsed.success) {
  const details = parsed.error.flatten().fieldErrors;
  throw new Error(
    `Invalid build/tooling environment variables. See details:\n${JSON.stringify(
      details,
      null,
      2,
    )}`,
  );
}

const data = parsed.data;

export const DATABASE_ENV: Environment = data.DATABASE_ENV;
export const DATABASE_URL: string = data.DATABASE_URL;
export const CYPRESS_BASE_URL: string | undefined = data.CYPRESS_BASE_URL;
export const SESSION_SECRET: string = data.SESSION_SECRET;
