// File: src/shared/config/env-schemas.ts
import { z } from "zod";

const NON_EMPTY = 1 as const;
const SESSION_SECRET_MIN = 20 as const;

export const EnvironmentSchema = z.enum(["development", "test", "production"]);
export type Environment = z.infer<typeof EnvironmentSchema>;

// Canonical server/tooling schema for secrets used everywhere
export const ServerEnvSchema = z.object({
  databaseUrl: z
    .string()
    .url("DATABASE_URL must be a valid URL")
    .min(NON_EMPTY),
  sessionAudience: z.string().min(NON_EMPTY),
  sessionIssuer: z.string().min(NON_EMPTY),
  sessionSecret: z
    .string()
    .min(
      SESSION_SECRET_MIN,
      `SESSION_SECRET must be at least ${SESSION_SECRET_MIN} chars`,
    ),
});

// If tooling needs slightly different keys, export an adapter schema shape (optional)
export const ToolingEnvShape = z.object({
  cypressBaseUrl: z.string().url().optional(),
  databaseEnv: EnvironmentSchema,
  databaseUrl: z.string().url(),
  sessionSecret: z.string().min(SESSION_SECRET_MIN),
});
