// File: src/shared/config/env-schemas.ts
import { z } from "zod";

const NON_EMPTY = 1 as const;

export const NODE_ENVIRONMENT_TUPLE = [
  "development",
  "production",
  "test",
] as const;
export const NodeEnvironmentSchema = z.enum(NODE_ENVIRONMENT_TUPLE);
export type NodeEnvironment = z.infer<typeof NodeEnvironmentSchema>;

export const DATABASE_ENVIRONMENT_TUPLE = [
  "development",
  "production",
  "test",
] as const;
export const DatabaseEnvironmentSchema = z.enum(DATABASE_ENVIRONMENT_TUPLE);
export type DatabaseEnvironment = z.infer<typeof DatabaseEnvironmentSchema>;

export const LOG_LEVEL_TUPLE = [
  "trace",
  "debug",
  "info",
  "warn",
  "error",
] as const;
export const LogLevelSchema = z.enum(LOG_LEVEL_TUPLE);
export type LogLevel = z.infer<typeof LogLevelSchema>;

export const SESSION_ISSUER_TUPLE = ["my-app"] as const;
export const SessionIssuerSchema = z.enum(SESSION_ISSUER_TUPLE);
export type SessionIssuer = z.infer<typeof SessionIssuerSchema>;

export const SESSION_AUDIENCE_TUPLE = ["web"] as const;
export const SessionAudienceSchema = z.enum(SESSION_AUDIENCE_TUPLE);
export type SessionAudience = z.infer<typeof SessionAudienceSchema>;

// Canonical server/tooling schema for secrets used everywhere
export const ServerEnvSchema = z.object({
  databaseUrl: z.string().min(NON_EMPTY),
  sessionAudience: SessionAudienceSchema,
  sessionIssuer: SessionIssuerSchema,
  sessionSecret: z.string().min(NON_EMPTY),
});
