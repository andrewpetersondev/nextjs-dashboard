import { z } from "zod";

const DATABASE_ENVIRONMENT_TUPLE = [
	"development",
	"production",
	"test",
] as const;

const DatabaseEnvironmentSchema = z.enum(DATABASE_ENVIRONMENT_TUPLE);

/** Inclusive bounds of the usable TCP port range. */
const MIN_TCP_PORT = 1;
const MAX_TCP_PORT = 65_535;

export const CypressEnvShape = z.object({
	authBcryptSaltRounds: z.coerce.number().int().positive(),
	databaseEnv: DatabaseEnvironmentSchema,
	databaseUrl: z.string().min(1),
	port: z.coerce.number().int().min(MIN_TCP_PORT).max(MAX_TCP_PORT),
	sessionSecret: z.string().min(1),
});
