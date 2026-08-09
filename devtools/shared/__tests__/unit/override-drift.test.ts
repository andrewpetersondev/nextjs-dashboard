import {
	compareOverrides,
	parseOverrides,
} from "@devtools/shared/override-drift";
import { describe, expect, it } from "vitest";

/**
 * Unit tests for the override-drift decision and its parser.
 *
 * Two things are pinned here, and the parser is the more important of the two.
 * The comparison is a string equality; the parser is hand-rolled YAML, and its
 * dangerous failure is not a crash but a QUIET one — a parser that stops
 * matching the file's format and returns an empty map turns the gate into a
 * permanent green light. So the throw-on-nothing-parsed cases below are the
 * point of this file, not edge-case padding.
 */

const WORKSPACE = `packages:
  - .

allowBuilds:
  cypress: true

overrides:
  # GHSA-g7r4-m6w7-qqqr (esbuild, patched 0.28.1)
  esbuild: ^0.28.1
  vite: ^7.3.5
  postcss: ^8.5.25

peerDependencyRules:
  allowedVersions:
    "tsconfck>typescript": "7"
`;

describe("parseOverrides", () => {
	it("reads the entries of the overrides block", () => {
		expect([...parseOverrides(WORKSPACE)]).toEqual([
			["esbuild", "^0.28.1"],
			["vite", "^7.3.5"],
			["postcss", "^8.5.25"],
		]);
	});

	it("stops at the next top-level key rather than absorbing it", () => {
		// The regression this prevents: swallowing `peerDependencyRules` would
		// invent overrides for packages that have none.
		expect(parseOverrides(WORKSPACE).has("allowedVersions")).toBe(false);
		expect(parseOverrides(WORKSPACE).has("tsconfck>typescript")).toBe(false);
	});

	it("reads scoped and quoted package names", () => {
		const parsed = parseOverrides(
			'overrides:\n  "@types/node": 24.9.2\n  @scope/pkg: ^1.0.0\n',
		);
		expect(parsed.get("@types/node")).toBe("24.9.2");
		expect(parsed.get("@scope/pkg")).toBe("^1.0.0");
	});

	it("strips a trailing comment from a value", () => {
		expect(
			parseOverrides("overrides:\n  postcss: ^8.5.25 # dedupe\n").get(
				"postcss",
			),
		).toBe("^8.5.25");
	});

	it("throws when there is no overrides block at all", () => {
		expect(() => parseOverrides("packages:\n  - .\n")).toThrow(
			/no `overrides:` block found/,
		);
	});

	it("throws when the block exists but parses to nothing", () => {
		// A green run here would mean the guard silently stopped checking.
		expect(() => parseOverrides("overrides:\n\npackages:\n  - .\n")).toThrow(
			/parsed to zero entries/,
		);
	});

	it("throws on nested structure instead of skipping the line", () => {
		expect(() =>
			parseOverrides("overrides:\n  foo:\n    bar: ^1.0.0\n"),
		).toThrow(/cannot parse this line/);
	});
});

describe("compareOverrides", () => {
	const declared = new Map([
		["postcss", "^8.5.25"],
		["next", "16.2.12"],
	]);

	it("reports an overlapping package whose ranges match as aligned", () => {
		const result = compareOverrides(
			new Map([["postcss", "^8.5.25"]]),
			declared,
		);
		expect(result).toEqual({
			aligned: ["postcss"],
			drifted: [],
			overrideOnly: [],
		});
	});

	it("reports the real drift: package.json moved, the override did not", () => {
		const result = compareOverrides(
			new Map([["postcss", "^8.5.24"]]),
			declared,
		);
		expect(result.aligned).toEqual([]);
		expect(result.drifted).toEqual([
			{ declared: "^8.5.25", override: "^8.5.24", pkg: "postcss" },
		]);
	});

	it("treats semver-compatible but differently-written ranges as drift", () => {
		// Equality is exact on purpose. `^8.5.25` and `8.5.25` resolve compatibly
		// but are not the same pin, and "compatible but different" is precisely
		// how the graph ends up with two copies.
		expect(
			compareOverrides(new Map([["postcss", "8.5.25"]]), declared).drifted,
		).toHaveLength(1);
	});

	it("does not treat an override-only package as drift", () => {
		// esbuild/vite/sharp force a transitive resolution the project never
		// depends on directly — there is nothing for them to disagree with.
		const result = compareOverrides(
			new Map([
				["esbuild", "^0.28.1"],
				["postcss", "^8.5.25"],
			]),
			declared,
		);
		expect(result.overrideOnly).toEqual(["esbuild"]);
		expect(result.drifted).toEqual([]);
	});

	it("reports every drifted package, not just the first", () => {
		const result = compareOverrides(
			new Map([
				["postcss", "^8.5.24"],
				["next", "16.2.11"],
			]),
			declared,
		);
		expect(result.drifted.map((d) => d.pkg)).toEqual(["postcss", "next"]);
	});
});
