import { z } from "zod";

const DATABASE_ENVIRONMENT_TUPLE = [
	"development",
	"production",
	"test",
] as const;

const DatabaseEnvironmentSchema = z.enum(DATABASE_ENVIRONMENT_TUPLE);

/**
 * Environment contract for CLIs and build scripts, not the running app.
 *
 * Kept separate from the app's own env schemas because tooling runs outside
 * Next.js and must not pull `src/` config — the price is that the two schemas
 * are independent and can drift.
 */
export const ToolingEnvShape = z.object({
	databaseEnv: DatabaseEnvironmentSchema,
	databaseUrl: z.string().min(1),
	sessionSecret: z.string().min(1),
});
