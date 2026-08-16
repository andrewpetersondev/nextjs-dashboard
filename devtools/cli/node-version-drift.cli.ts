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
 *
 * FIFTH AXIS, added 2026-08-12: `@types/node`. The four above all concern the
 * runtime; this one concerns what the TYPE-CHECKER believes that runtime is.
 * `@types/node` majors track Node majors, so a range above the pinned major hands
 * `tsc` an API surface production does not have — and unlike the four above, that
 * state is invisible in a green build, because a superset of the real API is not
 * a type error. It went unnoticed here until 903fdf59. See `reportTypesMajor`.
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

// Not a file — a dependency range inside package.json. Kept beside the three
// above because it declares the same number they do, just for the type-checker.
const TYPES_NODE = "@types/node";

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

/**
 * Compare the `@types/node` major against the major the three files agree on.
 *
 * Deliberately NOT folded into the set above. Those three declare a RUNTIME and
 * share one failure message about shipping what you tested; this declares the API
 * surface `tsc` believes that runtime has. Same number, different claim.
 *
 * Hard failure everywhere, unlike `reportRunningMajor`. That asymmetry is about
 * cause rather than severity: a running-major mismatch is usually a workstation
 * setting, while this range lives in `package.json` and is a repo defect wherever
 * it is read.
 *
 * EQUALITY, not a ceiling (`<=`) — the deliberate call, recorded because the
 * looser rule is defensible and someone will ask. Types ABOVE the runtime is the
 * failure that prompted the guard: `tsc` accepts an API production does not have,
 * and it lands as a runtime TypeError no type-check can reach. `@types/node` sat
 * at `^26.2.0` against Node 24 until 903fdf59, and Dependabot re-proposed it
 * GREEN six hours later (PR #133), because a superset is not a type error. Types
 * BELOW the runtime is safe in isolation — a subset describes APIs that really
 * exist — but not free: real APIs read as type errors, get silenced with `as any`
 * or `@ts-expect-error`, and those casts outlive the eventual bump as permanent
 * holes. A ceiling permits that whole band silently.
 *
 * The tiebreaker is this file's own thesis. It already refuses an open-ended
 * `engines.node` (">=24") because a rule that admits a range leaves the choice to
 * someone else and moves without a commit — and a ceiling is that same looseness.
 * The cost is real and accepted: an intentional Node major migration must touch
 * this line too, the way lifting the `next` hold is deliberately a two-file edit.
 */
function reportTypesMajor(agreed: number): void {
	const pkg = JSON.parse(read(PACKAGE_JSON)) as {
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
	};
	// Both maps: the range is in devDependencies today, but a guard that reads
	// only one half would go quiet the day it moves rather than report on it.
	const raw = { ...pkg.dependencies, ...pkg.devDependencies }[TYPES_NODE];

	if (!raw) {
		throw new Error(
			`[node-version] FAIL — ${PACKAGE_JSON} declares no "${TYPES_NODE}".\n` +
				"  Nothing then ties the type-checker's view of the Node API to the major\n" +
				"  the files above pin, which is the drift this check exists to report.",
		);
	}

	const match = PINNED_MAJOR.exec(raw);
	if (!match?.[1]) {
		throw new Error(
			`[node-version] FAIL — "${TYPES_NODE}" is "${raw}", which does not pin a ` +
				"single major.\n" +
				"  Install would then be free to cross a Node major without an edit — the\n" +
				`  same open-range problem "engines.node" is checked for above. Pin ${agreed}.x.`,
		);
	}

	const major = Number(match[1]);
	if (major === agreed) {
		console.log(
			`[node-version] OK — ${TYPES_NODE} ${raw} matches Node ${agreed}.`,
		);
		return;
	}

	const direction =
		major > agreed
			? "  The types describe an API surface WIDER than the runtime ships. `tsc`\n" +
				"  accepts calls to Node APIs that production does not have, and the failure\n" +
				"  arrives as a TypeError at runtime — no type-check can catch it. This is\n" +
				"  why a bump here can pass every check and still be wrong.\n"
			: "  The types describe an API surface NARROWER than the runtime ships, so real\n" +
				"  APIs read as type errors and get silenced with casts that then outlive the\n" +
				"  eventual bump.\n";

	throw new Error(
		`[node-version] FAIL — "${TYPES_NODE}" is "${raw}" (major ${major}) but the ` +
			`pinned Node major is ${agreed}.\n\n${direction}\n` +
			`  Set "${TYPES_NODE}" to the ${agreed}.x line.`,
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
	// Declarations first, environment last: `@types/node` is a repo declaration
	// like the three above, while the running major is a property of the machine.
	reportTypesMajor(major);
	reportRunningMajor(major);
}

try {
	main();
	process.exit(0);
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
}
