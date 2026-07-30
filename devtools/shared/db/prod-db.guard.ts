import process from "node:process";

/**
 * Guard for destructive database tasks (reset/seed).
 *
 * `db:reset:prod` / `db:seed:prod` load `.env.production.local`, so a single
 * command (or a `:dev` → `:prod` typo) would otherwise run a destructive task
 * against the production database. Destructive tasks call
 * `assertDestructiveDbTaskAllowed` before touching the database: the loaded
 * environment must identify as a known non-production `DATABASE_ENV`, or the
 * operator must explicitly opt in with `CONFIRM_PROD_DB=yes`. A missing or
 * unrecognized `DATABASE_ENV` is treated like production (fail closed).
 */

/** `DATABASE_ENV` values allowed to run destructive tasks without confirmation. */
const NON_PROD_DATABASE_ENVS: readonly string[] = ["development", "test"];

interface DestructiveDbTaskEnv {
	readonly CONFIRM_PROD_DB?: string | undefined;
	readonly DATABASE_ENV?: string | undefined;
}

/** Env var an operator must set to run a destructive task against production. */
export const PROD_DB_CONFIRM_VAR = "CONFIRM_PROD_DB";

/** Exact value required — near-misses (`y`, `true`, `1`, `YES`) are rejected. */
export const PROD_DB_CONFIRM_VALUE = "yes";

/**
 * Pure decision: may a destructive DB task run under this environment?
 * Kept side-effect free so the policy is unit-testable without `process.env`.
 */
export function isDestructiveDbTaskAllowed(env: DestructiveDbTaskEnv): boolean {
	const databaseEnv = env.DATABASE_ENV;
	if (
		databaseEnv !== undefined &&
		NON_PROD_DATABASE_ENVS.includes(databaseEnv)
	) {
		return true;
	}
	return env.CONFIRM_PROD_DB === PROD_DB_CONFIRM_VALUE;
}

/**
 * Abort a destructive DB task unless the environment allows it.
 *
 * Throwing (rather than returning a Result) is deliberate: devtools CLIs use
 * `runCli`'s catch as their error boundary, and a blocked production reset must
 * exit non-zero so a typo'd `:prod` command fails loudly.
 */
export function assertDestructiveDbTaskAllowed(
	taskLabel: string,
	// Read keys individually instead of assigning `process.env` wholesale:
	// with `experimental.typedEnv`, ProcessEnv's declared keys come from the
	// env files present, so in CI/Vercel (no env files) the whole-object
	// assignment fails TS2559 despite compiling locally.
	env: DestructiveDbTaskEnv = {
		CONFIRM_PROD_DB: process.env[PROD_DB_CONFIRM_VAR],
		DATABASE_ENV: process.env.DATABASE_ENV,
	},
): void {
	if (isDestructiveDbTaskAllowed(env)) {
		return;
	}
	const seen =
		env.DATABASE_ENV === undefined ? "unset" : `"${env.DATABASE_ENV}"`;
	throw new Error(
		`Refusing to run ${taskLabel}: DATABASE_ENV is ${seen}, which is treated as production. ` +
			`If you really intend to run this against the production database, re-run with ${PROD_DB_CONFIRM_VAR}=${PROD_DB_CONFIRM_VALUE}.`,
	);
}
