import { execFile } from "node:child_process";
import process from "node:process";
import { promisify } from "node:util";
import type { SmokeReport } from "@devtools/shared/smoke-report";

/**
 * Is the deployment running the CURRENT code, not merely healthy code?
 *
 * Every other check in the production smoke suite is a LIVENESS probe, and
 * liveness stays green through the failure this one exists to catch: when a
 * build fails, Vercel keeps the previous deployment serving. Health returns 200,
 * the landing tagline is present (it is a stable constant, so the old build has
 * it too), login works, the auth guard holds — five green checks against a
 * deployment running last week's code.
 *
 * Identity is the only thing that separates those two states, so this compares
 * the SHA the deployment reports at `/api/health` against the SHA `main`
 * actually points at on the remote.
 */

const run = promisify(execFile);

const WHITESPACE = /\s+/;
const SHA_DISPLAY_LENGTH = 7;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const HTTP_OK = 200;

const LABEL = "deploy-freshness";

/**
 * How long after a push a SHA mismatch is still explained by a build in
 * progress rather than a build that failed.
 *
 * 30 minutes. A Vercel build of this project takes a few minutes, so the window
 * only has to cover "pushed shortly before the run" — and the routine is DAILY,
 * so widening it further would not surface a failed build any sooner anyway.
 * The cost of going too short is the one that matters: a watchdog that fails
 * every time it happens to run mid-deploy is a watchdog you learn to ignore.
 */
const DEPLOY_IN_FLIGHT_MINUTES = 30;
const DEPLOY_IN_FLIGHT_SECONDS = DEPLOY_IN_FLIGHT_MINUTES * SECONDS_PER_MINUTE;

/**
 * What the deployed and expected SHAs mean together.
 *
 * Pure, and separate from the probing and reporting around it, because this is
 * the whole decision: everything else is I/O. `lagSeconds` is how long ago the
 * newest commit on `main` was authored, or null when that commit is not
 * available locally to date.
 */
export type FreshnessVerdict =
	| { readonly kind: "current" }
	| { readonly kind: "in-flight"; readonly lagSeconds: number }
	| { readonly kind: "stale"; readonly lagSeconds: number }
	| { readonly kind: "undatable" };

// biome-ignore lint/style/useExportsLast: the pure decision leads this file on purpose — the I/O that feeds it follows, per the module doc above.
export function classifyFreshness(
	deployed: string,
	expected: string,
	lagSeconds: number | null,
): FreshnessVerdict {
	if (deployed === expected) {
		return { kind: "current" };
	}
	if (lagSeconds === null) {
		return { kind: "undatable" };
	}
	return lagSeconds < DEPLOY_IN_FLIGHT_SECONDS
		? { kind: "in-flight", lagSeconds }
		: { kind: "stale", lagSeconds };
}

function shortSha(sha: string): string {
	return sha.slice(0, SHA_DISPLAY_LENGTH);
}

function minutes(seconds: number): number {
	return Math.round(seconds / SECONDS_PER_MINUTE);
}

/**
 * The SHA `main` points at ON THE REMOTE, or null if it cannot be resolved.
 *
 * Deliberately `ls-remote` rather than `rev-parse origin/main`: a local
 * remote-tracking ref is only as fresh as the last fetch, and a stale one would
 * make a stale deployment compare EQUAL — a false pass on exactly the failure
 * this check exists to catch. Reads nothing from the working tree and writes
 * nothing to `.git`.
 *
 * `PROD_SMOKE_EXPECTED_SHA` overrides it, for targets not built from `main`
 * (a preview deployment would otherwise always read as stale).
 */
async function resolveRemoteMainSha(): Promise<string | null> {
	const override = process.env.PROD_SMOKE_EXPECTED_SHA?.trim();
	if (override) {
		return override;
	}

	try {
		const { stdout } = await run("git", [
			"ls-remote",
			"origin",
			"refs/heads/main",
		]);
		return stdout.trim().split(WHITESPACE)[0] ?? null;
	} catch {
		return null;
	}
}

/**
 * Seconds since `sha` was authored, or null when the object is not available
 * locally — which is itself informative: an unknown commit means the caller
 * cannot distinguish a failed deploy from one still building.
 */
async function commitAgeSeconds(sha: string): Promise<number | null> {
	try {
		const { stdout } = await run("git", ["log", "-1", "--format=%ct", sha]);
		const authoredAt = Number.parseInt(stdout.trim(), 10);
		return Number.isNaN(authoredAt)
			? null
			: Math.max(0, Date.now() / MS_PER_SECOND - authoredAt);
	} catch {
		return null;
	}
}

/** Reads the commit the live deployment reports, or null if it reports none. */
async function fetchDeployedSha(report: SmokeReport): Promise<string | null> {
	const { response, body } = await report.fetch("/api/health");

	if (response.status !== HTTP_OK) {
		report.warn(
			LABEL,
			"skipped — /api/health did not answer (see the health check above)",
		);
		return null;
	}

	const deployed = (JSON.parse(body) as { commit?: string }).commit;
	if (!deployed) {
		report.warn(
			LABEL,
			"the deployment reports no commit — it predates commit reporting, or VERCEL_GIT_COMMIT_SHA is unset",
		);
		return null;
	}

	return deployed;
}

/** Records whether production is serving the newest commit on `main`. */
export async function checkDeployFreshness(report: SmokeReport): Promise<void> {
	const deployed = await fetchDeployedSha(report);
	if (!deployed) {
		return;
	}

	const expected = await resolveRemoteMainSha();
	if (!expected) {
		report.warn(
			LABEL,
			`cannot resolve the expected SHA (no reachable git remote); deployment reports ${shortSha(deployed)}`,
		);
		return;
	}

	const verdict = classifyFreshness(
		deployed,
		expected,
		deployed === expected ? null : await commitAgeSeconds(expected),
	);

	switch (verdict.kind) {
		case "current":
			report.note(`deploy is current (${shortSha(deployed)})`);
			break;
		case "undatable":
			report.warn(
				LABEL,
				`serving ${shortSha(deployed)} but main is ${shortSha(expected)} — cannot date that commit locally, so this may be a deploy in flight`,
			);
			break;
		case "in-flight":
			report.note(
				`deploy in flight: serving ${shortSha(deployed)}, main moved to ${shortSha(expected)} ${minutes(verdict.lagSeconds)}m ago`,
			);
			break;
		case "stale":
			report.fail(
				LABEL,
				`serving ${shortSha(deployed)} but main has been at ${shortSha(expected)} for ${minutes(verdict.lagSeconds)}m — the build or deploy did not succeed, and production is running older code while every liveness check passes`,
			);
			break;
		default:
			break;
	}
}
