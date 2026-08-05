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
 * TODO(andrew): choose this value — see `isDeployInFlight` below.
 */
const DEPLOY_IN_FLIGHT_SECONDS = 0;

/**
 * Is a SHA mismatch still plausibly a deploy that simply has not landed yet?
 *
 * TODO(andrew): implement the policy. `lagSeconds` is how long ago the newest
 * commit on `main` was authored; return `true` to treat the mismatch as
 * in-flight (reported as a note, run stays green) and `false` to fail the run.
 *
 * The trade-off: too short and the watchdog fails every time it happens to run
 * while a legitimate deploy is building, which trains you to ignore it. Too
 * long and a genuinely failed build goes unreported — though note the routine
 * is DAILY, so any threshold under ~12h behaves identically except for pushes
 * made shortly before the 06:11 run.
 */
function isDeployInFlight(lagSeconds: number): boolean {
	return lagSeconds < DEPLOY_IN_FLIGHT_SECONDS;
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

	if (deployed === expected) {
		report.note(`deploy is current (${shortSha(deployed)})`);
		return;
	}

	const lagSeconds = await commitAgeSeconds(expected);
	if (lagSeconds === null) {
		report.warn(
			LABEL,
			`serving ${shortSha(deployed)} but main is ${shortSha(expected)} — cannot date that commit locally, so this may be a deploy in flight`,
		);
		return;
	}

	if (isDeployInFlight(lagSeconds)) {
		report.note(
			`deploy in flight: serving ${shortSha(deployed)}, main moved to ${shortSha(expected)} ${minutes(lagSeconds)}m ago`,
		);
		return;
	}

	report.fail(
		LABEL,
		`serving ${shortSha(deployed)} but main has been at ${shortSha(expected)} for ${minutes(lagSeconds)}m — the build or deploy did not succeed, and production is running older code while every liveness check passes`,
	);
}
