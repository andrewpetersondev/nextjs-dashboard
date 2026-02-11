import { z } from "zod";

export const NODE_ENVIRONMENT_TUPLE = [
  "development",
  "production",
  "test",
] as const;

// biome-ignore lint/nursery/useExplicitType: fix
export const NodeEnvironmentSchema = z.enum(NODE_ENVIRONMENT_TUPLE);

export type NodeEnvironment = z.infer<typeof NodeEnvironmentSchema>;

export const DATABASE_ENVIRONMENT_TUPLE = [
  "development",
  "production",
  "test",
] as const;

// biome-ignore lint/nursery/useExplicitType: fix
export const DatabaseEnvironmentSchema = z.enum(DATABASE_ENVIRONMENT_TUPLE);

export type DatabaseEnvironment = z.infer<typeof DatabaseEnvironmentSchema>;

export const LOG_LEVEL_TUPLE = [
  "trace",
  "debug",
  "info",
  "warn",
  "error",
] as const;

// biome-ignore lint/nursery/useExplicitType: fix
export const LogLevelSchema = z.enum(LOG_LEVEL_TUPLE);
/**
 * Represents log severity levels used throughout the application.
 * Available values: 'trace', 'debug', 'info', 'warn', 'error'
 */
export type LogLevel = z.infer<typeof LogLevelSchema>;

export const SESSION_ISSUER_TUPLE = ["my-app"] as const;

// biome-ignore lint/nursery/useExplicitType: fix
export const SessionIssuerSchema = z.enum(SESSION_ISSUER_TUPLE);

export type SessionIssuer = z.infer<typeof SessionIssuerSchema>;

export const SESSION_AUDIENCE_TUPLE = ["web"] as const;

// biome-ignore lint/nursery/useExplicitType: fix
export const SessionAudienceSchema = z.enum(SESSION_AUDIENCE_TUPLE);

export type SessionAudience = z.infer<typeof SessionAudienceSchema>;

// Canonical server/tooling schema for secrets used everywhere
// biome-ignore lint/nursery/useExplicitType: fix
export const ServerEnvSchema = z.object({
  authBcryptSaltRounds: z.coerce.number().int().positive(),
  databaseUrl: z.string().min(1),
  sessionAudience: SessionAudienceSchema,
  sessionIssuer: SessionIssuerSchema,
  sessionSecret: z.string().min(1),
});
