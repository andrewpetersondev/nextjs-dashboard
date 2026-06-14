import path from "node:path";
import { fileURLToPath } from "node:url";
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

/**
 * Path aliases mirrored from tsconfig so tests resolve `@/…` like the app does.
 * `tsconfigPaths()` reads tsconfig as well; the explicit list keeps the handful
 * of roots Vitest needs in one obvious place.
 */
const alias = {
	"@": path.resolve(rootDir, "src"),
	"@cypress": path.resolve(rootDir, "cypress"),
	"@database": path.resolve(rootDir, "database"),
	"@devtools": path.resolve(rootDir, "devtools"),
	"@test-support": path.resolve(rootDir, "test-support"),
};

/**
 * Schema-valid DUMMY environment for the unit lane.
 *
 * These are NOT secrets — they exist only to satisfy the eager validation in
 * `src/shared/core/config/server/env-server.ts`, which parses the server env at
 * import time and throws if a variable is missing. Unit tests mock or inject the
 * real database, so the dummy `DATABASE_URL` is never actually connected to.
 *
 * This is what lets the unit lane run with no `.env.test.local` and no live
 * database — in a worktree, in CI, anywhere. Setting `DATABASE_URL` here also
 * guarantees a unit test can never accidentally reach a real database, even if
 * one happens to be present in the ambient environment.
 */
const unitEnv = {
	AUTH_BCRYPT_SALT_ROUNDS: "10",
	DATABASE_URL: "postgres://test:test@localhost:5432/unit_no_db",
	NODE_ENV: "test",
	SESSION_AUDIENCE: "web",
	SESSION_ISSUER: "my-app",
	SESSION_SECRET: "unit-test-session-secret-not-a-real-secret",
	/**
	 * Pin the unit lane to UTC so date logic is deterministic everywhere.
	 * Several invoice helpers mix UTC and local-time operations (`toISOString`
	 * vs date-fns `format` vs the `new Date(y, m, d)` local constructor), so a
	 * runner in a negative-offset zone (e.g. US Central) would format the same
	 * instant as the previous day and the tests would pass in CI but fail
	 * locally. UTC removes that machine dependence.
	 */
	TZ: "UTC",
} as const;

export default defineConfig({
	plugins: [tsconfigPaths()],

	resolve: {
		alias,
	},

	test: {
		/**
		 * Coverage is a root-level concern: it aggregates across whichever
		 * project(s) run. Listing every source file in `include` makes the report
		 * count files that have no tests yet, so it shows true breadth rather than
		 * just the slice that happens to be exercised.
		 */
		coverage: {
			exclude: [
				"**/*.config.*",
				"**/*.d.ts",
				"src/**/__tests__/**",
				"src/**/*.{test,spec}.{ts,tsx}",
			],
			include: ["src/**/*.{ts,tsx}"],
			provider: "v8",
			reporter: ["text", "html"],
			reportsDirectory: "./coverage",
			/**
			 * Regression floors, not targets. These sit a couple points below the
			 * 2026-06-14 baseline (stmts 22.53 / branch 20.25 / funcs 20.41 /
			 * lines 22.44 — low because `include` counts the whole untested
			 * breadth: UI, actions, repositories, DALs). The buffer keeps trivial
			 * line-count shifts from breaking CI while still catching real drops.
			 * Ratchet these up as breadth lands; never down to "fix" a red build.
			 * Enforced by `pnpm test:coverage`, which CI runs (the unit lane is
			 * DB-free).
			 */
			thresholds: {
				branches: 18,
				functions: 18,
				lines: 20,
				statements: 20,
			},
		},

		globals: true,

		/**
		 * Two lanes, separated by directory:
		 *
		 *   unit        — pure/mocked. No live database. Runs anywhere.
		 *   integration — exercises the REAL test database (insert/delete rows).
		 *
		 * Run them with `pnpm test:unit` / `pnpm test:integration` (or `test:all`).
		 */
		projects: [
			{
				extends: true,
				test: {
					env: unitEnv,
					environment: "node",
					exclude: [
						...configDefaults.exclude,
						"**/__tests__/integration/**",
						"**/*.js",
						"**/*.mjs",
					],
					include: ["src/**/*.{test,spec}.{ts,tsx}"],
					name: "unit",
					setupFiles: ["./vitest.setup.ts"],
				},
			},
			{
				extends: true,
				test: {
					// No dummy env here: integration runs via `pnpm test:integration`,
					// which loads `.env.test.local` (real DATABASE_URL, SESSION_SECRET,
					// …) before Vitest starts. The real values must win.
					env: {
						NODE_ENV: "test",
					},
					environment: "node",
					include: ["src/**/__tests__/integration/**/*.{test,spec}.{ts,tsx}"],
					name: "integration",
					setupFiles: ["./vitest.setup.ts"],
				},
			},
		],
	},
});
