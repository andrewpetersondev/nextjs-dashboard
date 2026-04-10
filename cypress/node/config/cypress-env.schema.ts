import { z } from "zod";

const DATABASE_ENVIRONMENT_TUPLE = [
	"development",
	"production",
	"test",
] as const;

const DatabaseEnvironmentSchema = z.enum(DATABASE_ENVIRONMENT_TUPLE);

export const CypressEnvShape = z.object({
	databaseEnv: DatabaseEnvironmentSchema,
	databaseUrl: z.string().min(1),
	// biome-ignore lint/style/noMagicNumbers: good enough
	port: z.coerce.number().int().min(1).max(65_535),
	sessionSecret: z.string().min(1),
});
