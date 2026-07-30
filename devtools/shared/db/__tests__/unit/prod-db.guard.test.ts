import {
	assertDestructiveDbTaskAllowed,
	isDestructiveDbTaskAllowed,
	PROD_DB_CONFIRM_VALUE,
	PROD_DB_CONFIRM_VAR,
} from "@devtools/shared/db/prod-db.guard";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Unit tests for the destructive-DB-task guard (`prod-db.guard.ts`).
 *
 * The guard protects `db:reset` / `db:seed` from running against production
 * by accident (e.g. a `:dev` → `:prod` typo). Contract under test:
 *  - `development` and `test` run without confirmation;
 *  - `production` requires the exact `CONFIRM_PROD_DB=yes` opt-in;
 *  - a missing or unrecognized DATABASE_ENV fails closed (treated as prod);
 *  - the assert throws a message naming the task and the opt-in variable,
 *    and reads `process.env` when no env is injected.
 */
describe("isDestructiveDbTaskAllowed", () => {
	it("allows development without confirmation", () => {
		expect(isDestructiveDbTaskAllowed({ DATABASE_ENV: "development" })).toBe(
			true,
		);
	});

	it("allows test without confirmation", () => {
		expect(isDestructiveDbTaskAllowed({ DATABASE_ENV: "test" })).toBe(true);
	});

	it("blocks production without confirmation", () => {
		expect(isDestructiveDbTaskAllowed({ DATABASE_ENV: "production" })).toBe(
			false,
		);
	});

	it("allows production with the exact confirmation value", () => {
		expect(
			isDestructiveDbTaskAllowed({
				CONFIRM_PROD_DB: PROD_DB_CONFIRM_VALUE,
				DATABASE_ENV: "production",
			}),
		).toBe(true);
	});

	it.each(["YES", "y", "true", "1", " yes ", ""])(
		"rejects near-miss confirmation value %j",
		(value) => {
			expect(
				isDestructiveDbTaskAllowed({
					CONFIRM_PROD_DB: value,
					DATABASE_ENV: "production",
				}),
			).toBe(false);
		},
	);

	it("fails closed when DATABASE_ENV is missing", () => {
		expect(isDestructiveDbTaskAllowed({})).toBe(false);
	});

	it("fails closed on an unrecognized DATABASE_ENV", () => {
		expect(isDestructiveDbTaskAllowed({ DATABASE_ENV: "staging" })).toBe(false);
	});
});

describe("assertDestructiveDbTaskAllowed", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("returns without throwing for a non-production environment", () => {
		expect(() =>
			assertDestructiveDbTaskAllowed("db:reset", { DATABASE_ENV: "test" }),
		).not.toThrow();
	});

	it("throws for production without confirmation, naming the task and opt-in", () => {
		expect(() =>
			assertDestructiveDbTaskAllowed("db:reset", {
				DATABASE_ENV: "production",
			}),
		).toThrow(
			`Refusing to run db:reset: DATABASE_ENV is "production", which is treated as production. If you really intend to run this against the production database, re-run with ${PROD_DB_CONFIRM_VAR}=${PROD_DB_CONFIRM_VALUE}.`,
		);
	});

	it("reports an unset DATABASE_ENV in the error message", () => {
		expect(() => assertDestructiveDbTaskAllowed("db:seed", {})).toThrow(
			/DATABASE_ENV is unset/,
		);
	});

	it("returns without throwing for production with confirmation", () => {
		expect(() =>
			assertDestructiveDbTaskAllowed("db:seed", {
				CONFIRM_PROD_DB: PROD_DB_CONFIRM_VALUE,
				DATABASE_ENV: "production",
			}),
		).not.toThrow();
	});

	it("reads process.env when no env is injected", () => {
		vi.stubEnv("DATABASE_ENV", "production");

		expect(() => assertDestructiveDbTaskAllowed("db:reset")).toThrow(
			/CONFIRM_PROD_DB=yes/,
		);

		vi.stubEnv(PROD_DB_CONFIRM_VAR, PROD_DB_CONFIRM_VALUE);

		expect(() => assertDestructiveDbTaskAllowed("db:reset")).not.toThrow();
	});
});
