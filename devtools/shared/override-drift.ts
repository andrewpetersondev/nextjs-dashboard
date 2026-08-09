/**
 * Override/dependency drift — the decision, separate from the file reading.
 *
 * `pnpm-workspace.yaml` `overrides` and `package.json` are two independent
 * declarations of the same version range, and nothing reconciles them. When a
 * package appears in BOTH, a bump to one silently leaves the other behind:
 * Dependabot moves the `package.json` range, the override keeps forcing the old
 * one, and the resolution the override existed to produce quietly stops
 * happening. `postcss` did exactly this between 2026-08-05 and 2026-08-07.
 *
 * Until now the rule lived as a comment above the `postcss` entry ("⚠ MUST equal
 * the `postcss` devDependency range in package.json"). This is that comment made
 * executable.
 *
 * Only the OVERLAP is gated. `esbuild`, `vite` and `sharp` are override-only by
 * design — they exist to force a transitive resolution the project never depends
 * on directly, so there is no counterpart to agree with and their absence is not
 * drift.
 *
 * Parsing is deliberately hand-rolled rather than pulling in a YAML dependency
 * for one gate, and deliberately STRICT: every line inside the block must be a
 * plain `key: value`, and anything else throws. A lenient parser that skipped
 * what it did not recognise would degrade into a guard that reports green while
 * comparing nothing — the failure mode this whole class of gate exists to
 * prevent.
 */

/** A package declared in both files, with the two ranges that must agree. */
interface DriftedOverride {
	readonly declared: string;
	readonly override: string;
	readonly pkg: string;
}

/** The `overrides:` key at column 0, optionally trailed by a comment. */
const OVERRIDES_KEY = /^overrides:\s*(?:#.*)?$/;

/** Any line starting in column 0 — i.e. the next top-level key, ending the block. */
const TOP_LEVEL = /^\S/;

/** Blank lines and whole-line comments, which may appear anywhere in the block. */
const BLANK_OR_COMMENT = /^\s*(?:#.*)?$/;

/**
 * One `  name: range` entry. The name may be bare (`postcss`), scoped
 * (`@types/node`), or quoted — pnpm's own docs use all three forms.
 */
const ENTRY = /^\s+(?:"([^"]+)"|'([^']+)'|([^\s"'#][^:]*?))\s*:\s*(.+)$/;

/** ` # trailing note` after a value. YAML requires the leading whitespace. */
const TRAILING_COMMENT = /\s+#.*$/;

/** A fully quoted value, e.g. `"7"`. */
const QUOTED = /^(?:"([^"]*)"|'([^']*)')$/;

function cleanValue(raw: string): string {
	const withoutComment = raw.replace(TRAILING_COMMENT, "").trim();
	const quoted = QUOTED.exec(withoutComment);
	return quoted?.[1] ?? quoted?.[2] ?? withoutComment;
}

/**
 * The `overrides` map from a `pnpm-workspace.yaml` source.
 *
 * Throws when the block is absent, empty, or contains a line this parser does
 * not understand — all three mean the guard cannot answer, and a guard that
 * cannot answer must say so rather than pass.
 */
function parseOverrides(source: string): ReadonlyMap<string, string> {
	const lines = source.split("\n");
	const start = lines.findIndex((line) => OVERRIDES_KEY.test(line));
	if (start === -1) {
		throw new Error(
			"no `overrides:` block found in pnpm-workspace.yaml — this guard cannot " +
				"verify anything. If the overrides were intentionally removed, delete " +
				"the guard rather than leaving it passing vacuously.",
		);
	}

	const found = new Map<string, string>();
	for (const line of lines.slice(start + 1)) {
		if (TOP_LEVEL.test(line)) {
			break;
		}
		if (!BLANK_OR_COMMENT.test(line)) {
			const entry = ENTRY.exec(line);
			const pkg = entry?.[1] ?? entry?.[2] ?? entry?.[3];
			const value = entry?.[4];
			if (!(pkg && value)) {
				throw new Error(
					`cannot parse this line inside the \`overrides:\` block:\n    ${line}\n` +
						"  Only plain `name: range` entries are supported. Nested structure " +
						"needs a real YAML parser here — do not relax this into skipping the line.",
				);
			}
			found.set(pkg.trim(), cleanValue(value));
		}
	}

	if (found.size === 0) {
		throw new Error(
			"the `overrides:` block parsed to zero entries — either it is empty or " +
				"this parser has stopped matching its format. Both leave the guard inert.",
		);
	}
	return found;
}

/**
 * The verdict for one repository: which overlapping packages agree, which have
 * drifted, and which overrides have no `package.json` counterpart at all.
 *
 * `overrideOnly` is reported rather than ignored so the output always states the
 * full accounting — a run that compared nothing looks identical to a clean run
 * unless it says how many comparisons it made.
 */
interface OverrideComparison {
	readonly aligned: readonly string[];
	readonly drifted: readonly DriftedOverride[];
	readonly overrideOnly: readonly string[];
}

/**
 * Compare the two declarations.
 *
 * Equality is EXACT string equality, not semver compatibility. The override
 * exists to pin one resolution for the whole graph; "compatible but different"
 * is precisely the state that produces two copies of a package, which is the
 * thing the `postcss` override was added to prevent.
 */
function compareOverrides(
	overrides: ReadonlyMap<string, string>,
	declared: ReadonlyMap<string, string>,
): OverrideComparison {
	const aligned: string[] = [];
	const drifted: DriftedOverride[] = [];
	const overrideOnly: string[] = [];

	for (const [pkg, override] of overrides) {
		const declaredRange = declared.get(pkg);
		if (declaredRange === undefined) {
			overrideOnly.push(pkg);
		} else if (declaredRange === override) {
			aligned.push(pkg);
		} else {
			drifted.push({ declared: declaredRange, override, pkg });
		}
	}

	return { aligned, drifted, overrideOnly };
}

// `DriftedOverride` and `OverrideComparison` are deliberately NOT exported:
// the CLI reads both through inference on `compareOverrides`, so exporting them
// would widen the surface without a consumer — the resolution the 2026-08-06
// knip triage settled on. Export one the day something has to name it.
export { compareOverrides, parseOverrides };
