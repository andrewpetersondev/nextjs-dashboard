import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
	compareOverrides,
	parseOverrides,
} from "@devtools/shared/override-drift";

/**
 * Override/dependency drift guard (CI gate).
 *
 * `pnpm-workspace.yaml` `overrides` and `package.json` declare the same version
 * range in two places that never read each other, so a bump to one silently
 * leaves the other behind. See `devtools/shared/override-drift.ts` for the full
 * reasoning; this file is only the I/O and the reporting around it.
 *
 * Pure file parsing — no network, no database, no env vars — so it runs in plain
 * CI beside the Node- and migration-drift gates.
 *
 * It is in `check:fast` as well as `check`, unlike `knip`. That is a deliberate
 * distinction rather than an oversight: mid-feature code legitimately has an
 * export whose consumer does not exist yet, so blocking every commit on knip
 * would train you to bypass the gate — but there is no half-finished state in
 * which an override is legitimately out of sync with its dependency.
 */

const ROOT = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
);

const WORKSPACE = "pnpm-workspace.yaml";
const PACKAGE_JSON = "package.json";

const LABEL = "[override-drift]";

function read(file: string): string {
	return readFileSync(path.join(ROOT, file), "utf8");
}

/** Every direct dependency range, prod and dev alike — overrides span both. */
function declaredRanges(): ReadonlyMap<string, string> {
	const pkg = JSON.parse(read(PACKAGE_JSON)) as {
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
	};
	return new Map(
		Object.entries({ ...pkg.dependencies, ...pkg.devDependencies }),
	);
}

function main(): void {
	const overrides = parseOverrides(read(WORKSPACE));
	const { aligned, drifted, overrideOnly } = compareOverrides(
		overrides,
		declaredRanges(),
	);

	if (drifted.length > 0) {
		const lines = [
			"an override no longer matches the dependency it overrides.",
			"",
		];
		for (const d of drifted) {
			lines.push(
				`  ${d.pkg}`,
				`    ${WORKSPACE} → ${d.override}`,
				`    ${PACKAGE_JSON} → ${d.declared}`,
			);
		}
		lines.push(
			"",
			"  These must be the SAME range. The override pins one resolution for the",
			"  whole dependency graph; when it falls behind the direct dependency the",
			"  graph forks into two copies of the package — which is the outcome the",
			"  override was added to prevent.",
			"",
			`  Update the \`overrides\` entry in ${WORKSPACE} to match, then re-run`,
			"  `pnpm install` so the lockfile records the new range.",
		);
		throw new Error(lines.join("\n"));
	}

	// Always state what was compared. A run that compared nothing is otherwise
	// indistinguishable from a clean one, which is how a gate rots into a no-op.
	const comparedSummary =
		aligned.length > 0
			? `${aligned.length} overlapping package(s) agree (${aligned.join(", ")})`
			: "no override has a package.json counterpart, so nothing to compare";

	console.log(
		`${LABEL} OK — ${comparedSummary}; ${overrideOnly.length} override-only ` +
			`(${overrideOnly.join(", ") || "none"}).`,
	);
}

try {
	main();
	process.exit(0);
} catch (error) {
	// Every throw below main() is a guard verdict, not a crash — the label and the
	// FAIL prefix are added here so no message has to remember to carry them.
	console.error(
		`${LABEL} FAIL — ${error instanceof Error ? error.message : String(error)}`,
	);
	process.exit(1);
}
