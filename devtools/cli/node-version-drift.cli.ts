import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/**
 * Node-version alignment guard (CI gate).
 *
 * The Node version is declared in three files, and no two of them read each
 * other — so they drift silently:
 *
 *   .nvmrc          — read by `actions/setup-node` in every CI job, and by nvm
 *                     locally. Governs dev + CI.
 *   package.json    — `engines.node`. This is the ONLY one Vercel reads, and it
 *                     OVERRIDES the Node version set in Vercel Project Settings.
 *                     Governs production.
 *   Dockerfile      — `FROM node:<major>-alpine`. Governs the standalone image.
 *
 * They had drifted before this guard existed: `.nvmrc` and the Dockerfile said
 * 26 while `engines.node` said `>=24`, which Vercel resolves to the newest major
 * it offers. Production ran a different Node major than dev, CI, and Docker, and
 * nothing anywhere reported it. Aligned on 24 on 2026-08-07.
 *
 * Pure file parsing — no network — so it runs in plain CI next to the
 * migration-drift gate.
 *
 * It also rejects an OPEN-ENDED `engines.node` range (`>=24`, `*`, `>24`).
 * That is not a style preference: Vercel maps a range to the newest major it
 * supports, so an open range means production silently jumps a Node major the
 * day Vercel adds one — with no commit, no PR, and no CI run to catch it. Pin
 * the major (`24.x`) so that move is a deliberate edit.
 *
 * FOURTH AXIS, added 2026-08-09: the major this process is ACTUALLY RUNNING.
 * The three checks above compare declarations against each other and never look
 * at `process.versions.node`, so all three can agree perfectly while the
 * developer runs something else entirely — which is what was happening here.
 * `.nvmrc` had never been consulted on the workstation at all (nvm's `default`
 * alias won, and no shell hook read the file), so dev ran Node 26 for days while
 * CI, Docker and Vercel ran 24. pnpm printed `Unsupported engine` on every
 * single command throughout and it was simply never noticed.
 *
 * The runtime check is asymmetric on purpose — see `reportRunningMajor`.
 */

const ROOT = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
);

// Each source of truth, with the label used in failure output.
const NVMRC = ".nvmrc";
const PACKAGE_JSON = "package.json";
const DOCKERFILE = "Dockerfile";

// `FROM node:24-alpine`, `FROM node:24.1.0-bookworm AS base`, etc. Captures the
// major. Global: a multi-stage Dockerfile can pull `node:` more than once, and
// every one of them has to agree.
const DOCKER_FROM_NODE = /^FROM\s+node:(\d+)[^\s]*/gim;

// An `engines.node` value that pins one major: "24.x", "^24.0.0", "24".
// Anything else (">=24", "*", "20 || 24") leaves the major up to the host.
const PINNED_MAJOR = /^\s*[\^~]?(\d+)(?:\.(?:x|\d+))*\s*$/;

// `.nvmrc` may hold `24`, `v24`, or a full `24.1.0`.
const NVMRC_MAJOR = /^v?(\d+)/;

interface Source {
	readonly file: string;
	readonly major: number;
	readonly raw: string;
}

function read(file: string): string {
	return readFileSync(path.join(ROOT, file), "utf8");
}

/** `.nvmrc` may hold `24`, `v24`, or a full `24.1.0`. Take the major. */
function nvmrcMajor(): Source {
	const raw = read(NVMRC).trim();
	const match = NVMRC_MAJOR.exec(raw);
	if (!match?.[1]) {
		throw new Error(
			`[node-version] FAIL — cannot parse a Node major from ${NVMRC} (found "${raw}").`,
		);
	}
	return { file: NVMRC, major: Number(match[1]), raw };
}

function enginesMajor(): Source {
	const pkg = JSON.parse(read(PACKAGE_JSON)) as {
		engines?: { node?: string };
	};
	const raw = pkg.engines?.node;
	if (!raw) {
		throw new Error(
			`[node-version] FAIL — ${PACKAGE_JSON} has no "engines.node". Vercel reads ` +
				"this field to choose the production Node version; without it the " +
				"runtime is whatever Project Settings happens to say.",
		);
	}
	const match = PINNED_MAJOR.exec(raw);
	if (!match?.[1]) {
		throw new Error(
			`[node-version] FAIL — "engines.node" is "${raw}", which does not pin a ` +
				"single major.\n" +
				"  Vercel resolves a range to the newest major it offers, so production " +
				"would jump a\n" +
				"  Node major on their schedule rather than yours — no commit, no CI run. " +
				'Use "24.x".',
		);
	}
	return { file: `${PACKAGE_JSON} engines.node`, major: Number(match[1]), raw };
}

function dockerfileMajors(): Source[] {
	const content = read(DOCKERFILE);
	const found = [...content.matchAll(DOCKER_FROM_NODE)];
	if (found.length === 0) {
		throw new Error(
			`[node-version] FAIL — no \`FROM node:<major>\` found in ${DOCKERFILE}.`,
		);
	}
	return found.map((m) => ({
		file: `${DOCKERFILE} (${m[0].trim()})`,
		major: Number(m[1]),
		raw: m[0].trim(),
	}));
}

/**
 * Is this a CI run?
 *
 * GitHub Actions sets `CI=true` (alongside `GITHUB_ACTIONS=true`), and `CI` is
 * the portable signal every provider agrees on, so that is what this reads. The
 * explicit negatives are honoured so `CI=false` in a shell means what it says.
 */
function isContinuousIntegration(): boolean {
	const flag = process.env.CI?.trim().toLowerCase();
	return flag !== undefined && flag !== "" && flag !== "false" && flag !== "0";
}

/**
 * Compare the major this process is RUNNING against the one the files agree on.
 *
 * Asymmetric on purpose: a hard failure in CI, a warning locally.
 *
 * In CI the running version is `.nvmrc` BY CONSTRUCTION — every job installs
 * Node through `actions/setup-node` with `node-version-file: .nvmrc`. So a
 * mismatch there cannot be somebody's shell; it means a job stopped reading that
 * file, or pinned a version of its own. That is the "declared but wired into
 * nothing" failure this repo keeps finding, and it earns a red build.
 *
 * Locally the cause is nearly always a shell that has not switched yet, and
 * `pnpm check:fast` is the pre-commit gate. Failing a commit over a workstation
 * setting is how a gate teaches you to bypass it — the same reasoning that keeps
 * knip out of `check:fast`. So: say it on every run, and let the commit through.
 */
function reportRunningMajor(agreed: number): void {
	const running = Number.parseInt(process.versions.node, 10);

	if (running === agreed) {
		console.log(
			`[node-version] OK — this process is running Node ${process.versions.node}.`,
		);
		return;
	}

	const mismatch =
		`the running Node major (${running}, from v${process.versions.node}) does not ` +
		`match the pinned major (${agreed}).`;

	if (isContinuousIntegration()) {
		throw new Error(
			`[node-version] FAIL — ${mismatch}\n\n` +
				"  In CI the running version comes from .nvmrc via `actions/setup-node`\n" +
				"  (node-version-file), so this is not a stray developer shell — a workflow\n" +
				"  job has stopped reading it, or pins a version of its own. Fix the workflow\n" +
				"  rather than the files; the three declarations already agree.",
		);
	}

	console.warn(
		`[node-version] WARN — ${mismatch}\n` +
			"  You are developing on a different Node major than CI, Docker and Vercel\n" +
			"  ship on, which is the exact scenario the three checks above exist to\n" +
			"  prevent — they just cannot see the runtime. Run `nvm use` here, or set up\n" +
			"  the .nvmrc shell hook in docs/getting-started.md so it happens on cd.\n" +
			"  Not failing: this is a workstation setting, not a repo defect.",
	);
}

function main(): void {
	const sources: Source[] = [
		nvmrcMajor(),
		enginesMajor(),
		...dockerfileMajors(),
	];

	const majors = new Set(sources.map((s) => s.major));
	if (majors.size > 1) {
		const lines = [
			"[node-version] FAIL — the Node major disagrees across files.",
			"",
		];
		for (const s of sources) {
			lines.push(`  ${s.major}  ← ${s.file}  ("${s.raw}")`);
		}
		lines.push(
			"",
			"  These are read by different consumers and none of them reconciles the",
			"  others: .nvmrc drives dev + CI, engines.node drives Vercel (production),",
			"  and the Dockerfile drives the standalone image. A mismatch means you are",
			"  testing on a different Node major than you ship on.",
			"",
			"  Set all of them to the same major.",
		);
		throw new Error(lines.join("\n"));
	}

	const [major] = [...majors];
	if (major === undefined) {
		// Unreachable — nvmrcMajor() always contributes one — but stated rather
		// than asserted away, so the runtime check below can never receive an
		// undefined "agreed" major and silently compare against NaN.
		throw new Error("[node-version] FAIL — no Node major could be determined.");
	}

	console.log(
		`[node-version] OK — Node ${major} across ${sources.map((s) => s.file.split(" ")[0]).join(", ")}.`,
	);
	reportRunningMajor(major);
}

try {
	main();
	process.exit(0);
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
}
