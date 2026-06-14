import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/**
 * Per-env migration drift guard (CI gate).
 *
 * The project keeps three independent drizzle migration sets —
 * `drizzle/migrations/{dev,test,prod}` — generated separately per environment
 * (see `drizzle.config.ts`, which routes `drizzle-kit` output by `DATABASE_ENV`).
 * Because they are generated independently, their final schemas can silently
 * drift: the 2026-06-11 incident created a fresh Neon prod DB whose migration
 * set was a revision behind dev/test, leaving an obsolete FK that failed
 * `db:seed:prod` with a 23503. The `weekly-maintenance` routine *reports* such
 * drift, but reporting is not enforcement.
 *
 * This guard is the enforcement half. It reads each env's LATEST snapshot (the
 * highest-`idx` entry in that env's `meta/_journal.json`) and asserts all three
 * describe the SAME final schema. It is a pure file comparison — no database,
 * no env vars — so it runs in plain CI alongside `check:fast`. A mismatch exits
 * non-zero with the diverging paths so the fix is obvious (re-generate the
 * stale set, or backfill the missing migration).
 *
 * Note: only the *final* schema is gated. Migration COUNT differences are
 * reported but not failed — what matters at runtime is that the end state
 * matches, not that every env took the same number of steps to get there.
 */

// Migration scopes, mirroring `migrationScopeByEnv` in drizzle.config.ts.
const ENVS = ["dev", "test", "prod"] as const;
type Env = (typeof ENVS)[number];

// Repo root, resolved from this file (devtools/cli/) so the guard works
// regardless of the caller's cwd.
const ROOT = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
);
const MIGRATION_ROOT = path.join(ROOT, "drizzle", "migrations");

// Per-migration bookkeeping that legitimately differs across independently
// generated sets and is NOT part of the final schema.
//   id / prevId — per-migration UUIDs, unique per env
//   _meta       — rename mappings used only during generation
const NON_SCHEMA_KEYS = new Set(["id", "prevId", "_meta"]);

// Drizzle qualifies table keys with their schema (e.g. "public.invoices"); strip
// the default-schema prefix for the human-readable summary line.
const PUBLIC_SCHEMA_PREFIX = /^public\./;

// Snapshot files are named by zero-padded journal index, e.g. "0006_snapshot.json".
const SNAPSHOT_INDEX_WIDTH = 4;

interface JournalEntry {
	readonly idx: number;
	readonly tag: string;
}

interface Journal {
	readonly entries: readonly JournalEntry[];
}

interface EnvSnapshot {
	readonly canonical: string;
	readonly count: number;
	readonly env: Env;
	readonly schema: unknown;
	readonly tag: string;
}

function readJson<T>(file: string): T {
	return JSON.parse(readFileSync(file, "utf8")) as T;
}

/** Recursively sort object keys so equality is independent of key order. */
function canonicalize(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(canonicalize);
	}
	if (value !== null && typeof value === "object") {
		const out: Record<string, unknown> = {};
		for (const key of Object.keys(value as Record<string, unknown>).sort()) {
			if (!NON_SCHEMA_KEYS.has(key)) {
				out[key] = canonicalize((value as Record<string, unknown>)[key]);
			}
		}
		return out;
	}
	return value;
}

/** Read the latest snapshot (highest journal idx) for one env. */
function latestSnapshot(env: Env): EnvSnapshot {
	const metaDir = path.join(MIGRATION_ROOT, env, "meta");
	const journal = readJson<Journal>(path.join(metaDir, "_journal.json"));
	const entries = [...journal.entries].sort((a, b) => a.idx - b.idx);
	const last = entries.at(-1);
	if (!last) {
		throw new Error(`No migrations recorded in ${metaDir}/_journal.json`);
	}
	const file = `${String(last.idx).padStart(SNAPSHOT_INDEX_WIDTH, "0")}_snapshot.json`;
	const raw = readJson<unknown>(path.join(metaDir, file));
	const schema = canonicalize(raw);
	return {
		canonical: JSON.stringify(schema),
		count: entries.length,
		env,
		schema,
		tag: last.tag,
	};
}

/** Collect up to `limit` JSON paths where two canonicalized values differ. */
function diffPaths(a: unknown, b: unknown, limit = 20, base = ""): string[] {
	const out: string[] = [];
	const walk = (left: unknown, right: unknown, p: string): void => {
		if (out.length >= limit) {
			return;
		}
		if (JSON.stringify(left) === JSON.stringify(right)) {
			return;
		}
		const isObj = (v: unknown): v is Record<string, unknown> =>
			v !== null && typeof v === "object" && !Array.isArray(v);
		if (isObj(left) && isObj(right)) {
			for (const key of new Set([
				...Object.keys(left),
				...Object.keys(right),
			])) {
				walk(left[key], right[key], p ? `${p}.${key}` : key);
			}
			return;
		}
		out.push(p || "(root)");
	};
	walk(a, b, base);
	return out.slice(0, limit);
}

function tableNames(schema: unknown): string {
	const tables = (schema as { tables?: Record<string, unknown> }).tables ?? {};
	const names = Object.keys(tables)
		.map((t) => t.replace(PUBLIC_SCHEMA_PREFIX, ""))
		.sort();
	return names.join(", ") || "(none)";
}

function main(): void {
	const snapshots = ENVS.map(latestSnapshot);
	const [reference, ...rest] = snapshots;
	if (!reference) {
		throw new Error("No migration sets found.");
	}

	const drifted = rest.filter((s) => s.canonical !== reference.canonical);

	if (drifted.length > 0) {
		const lines = [
			"[migration-drift] FAIL — migration sets describe different final schemas.",
			"",
			`  reference: ${reference.env} @ ${reference.tag}`,
		];
		for (const s of drifted) {
			const paths = diffPaths(reference.schema, s.schema);
			lines.push("", `  ${s.env} @ ${s.tag} differs at:`);
			for (const p of paths) {
				lines.push(`    - ${p}`);
			}
			if (paths.length === 0) {
				lines.push("    - (difference outside the gated schema fields)");
			}
		}
		lines.push(
			"",
			"  Re-generate the stale set(s) from ./database/schema (db:generate:<env>)",
			"  or backfill the missing migration so all three end states match.",
		);
		throw new Error(lines.join("\n"));
	}

	// Final schemas agree. Surface a count mismatch as a non-fatal note.
	const counts = snapshots.map((s) => `${s.env}=${s.count}`).join(", ");
	const countMismatch = new Set(snapshots.map((s) => s.count)).size > 1;
	const heads = snapshots.map((s) => `${s.env}@${s.tag}`).join(", ");

	console.log(
		`[migration-drift] OK — ${ENVS.join(", ")} describe the same final schema ` +
			`(tables: ${tableNames(reference.schema)}; latest: ${heads}).`,
	);
	if (countMismatch) {
		console.log(
			`[migration-drift] note: migration counts differ (${counts}) but the ` +
				"final schemas match, so this is informational only.",
		);
	}
}

try {
	main();
	process.exit(0);
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
}
