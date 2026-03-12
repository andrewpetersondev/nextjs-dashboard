import { z } from "zod";

const DATABASE_ENVIRONMENT_TUPLE = [
	"development",
	"production",
	"test",
] as const;

const DatabaseEnvironmentSchema = z.enum(DATABASE_ENVIRONMENT_TUPLE);

export const CypressEnvShape = z.object({
	cypressBaseUrl: z.url(),
	databaseEnv: DatabaseEnvironmentSchema,
	databaseUrl: z.string().min(1),
	sessionSecret: z.string().min(1),
});
