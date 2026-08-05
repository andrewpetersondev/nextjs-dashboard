/**
 * @file Which build is actually serving — the deployment's own provenance.
 *
 * Distinct from `env-server.ts`, which validates the REQUIRED secrets the app
 * cannot boot without. Everything here is optional by nature: it is injected by
 * the hosting platform, so it is absent when running locally, in Docker, and in
 * CI. A missing value is a normal state to report, never a startup failure —
 * which is why these do not go through `ServerEnvSchema`.
 *
 * Lives in the config layer because Biome's `noProcessEnv` rule is only relaxed
 * here (and in `src/server/**` and `devtools/**`). Route handlers must not read
 * `process.env` directly, so consumers import these accessors instead.
 */

import "server-only";

/** Reads an optional platform variable, normalising blank to absent. */
function optionalPlatformVar(raw: string | undefined): string | undefined {
	const trimmed = raw?.trim();
	return trimmed ? trimmed : undefined;
}

/**
 * The git commit this deployment was built from, or `undefined` off-platform.
 *
 * Vercel injects `VERCEL_GIT_COMMIT_SHA` as a system environment variable,
 * available to the Node runtime at request time — not only at build time — so a
 * `force-dynamic` route can report it without any build-time inlining.
 *
 * NOT A SECRET: this repository is public, so its commit SHAs are already
 * published. Exposing it is what lets an external prober tell a healthy
 * deployment apart from a *current* one — see `devtools/cli/prod-smoke.cli.ts`.
 */
export function getDeployedCommitSha(): string | undefined {
	return optionalPlatformVar(process.env.VERCEL_GIT_COMMIT_SHA);
}
