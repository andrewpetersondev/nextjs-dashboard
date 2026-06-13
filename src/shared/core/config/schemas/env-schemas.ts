import { z } from "zod";

const NODE_ENVIRONMENT_TUPLE = ["development", "production", "test"] as const;
const DATABASE_ENVIRONMENT_TUPLE = [
	"development",
	"production",
	"test",
] as const;
const LOG_LEVEL_TUPLE = ["trace", "debug", "info", "warn", "error"] as const;

export const NodeEnvironmentSchema = z.enum(NODE_ENVIRONMENT_TUPLE);

export type NodeEnvironment = z.infer<typeof NodeEnvironmentSchema>;

export const DatabaseEnvironmentSchema = z.enum(DATABASE_ENVIRONMENT_TUPLE);

export type DatabaseEnvironment = z.infer<typeof DatabaseEnvironmentSchema>;

export const LogLevelSchema = z.enum(LOG_LEVEL_TUPLE);
/**
 * Represents log severity levels used throughout the application.
 * Available values: 'trace', 'debug', 'info', 'warn', 'error'
 */
export type LogLevel = z.infer<typeof LogLevelSchema>;

// Canonical server/tooling schema for secrets used everywhere
export const ServerEnvSchema = z.object({
	authBcryptSaltRounds: z.coerce.number().int().positive(),
	databaseUrl: z.string().min(1),
	sessionSecret: z.string().min(1),
});
