import { describe, expect, it } from "vitest";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import {
	PG_CODES,
	PG_CONDITIONS,
} from "@/shared/core/errors/server/adapters/postgres/pg-error.constants";
import { toPgError } from "@/shared/core/errors/server/adapters/postgres/to-pg-error";

/**
 * Unit tests for toPgError (to-pg-error.ts).
 *
 * toPgError is the classifier the DAL relies on to turn a raw driver error into
 * an app-level mapping. The integration suite already proved that a unique
 * violation (23505) must surface as a "conflict" — these tests pin that mapping
 * and the chain-walking behavior directly, fast, without a database.
 */
describe("toPgError", () => {
	it("maps a unique violation (23505) to a conflict", () => {
		const mapping = toPgError({ code: PG_CODES.UNIQUE_VIOLATION });

		expect(mapping.appErrorKey).toBe(APP_ERROR_KEYS.conflict);
		expect(mapping.pgCondition).toBe(PG_CONDITIONS.pg_unique_violation);
		expect(mapping.pgErrorMetadata.pgCode).toBe(PG_CODES.UNIQUE_VIOLATION);
	});

	it.each([
		[PG_CODES.FOREIGN_KEY_VIOLATION, PG_CONDITIONS.pg_foreign_key_violation],
		[PG_CODES.NOT_NULL_VIOLATION, PG_CONDITIONS.pg_not_null_violation],
		[PG_CODES.CHECK_VIOLATION, PG_CONDITIONS.pg_check_violation],
	])("maps integrity violation %s to %s", (code, condition) => {
		const mapping = toPgError({ code });

		expect(mapping.appErrorKey).toBe(APP_ERROR_KEYS.integrity);
		expect(mapping.pgCondition).toBe(condition);
	});

	it("extracts native pg fields (constraint/table/detail) when present", () => {
		const mapping = toPgError({
			code: PG_CODES.UNIQUE_VIOLATION,
			constraint: "users_email_key",
			detail: "Key (email)=(a@b.c) already exists.",
			table: "users",
		});

		expect(mapping.pgErrorMetadata).toMatchObject({
			constraint: "users_email_key",
			detail: "Key (email)=(a@b.c) already exists.",
			pgCode: PG_CODES.UNIQUE_VIOLATION,
			table: "users",
		});
	});

	it("walks the cause chain (BFS) to find a buried pg code", () => {
		const wrapped = {
			cause: { code: PG_CODES.UNIQUE_VIOLATION },
			message: "wrapper with no code of its own",
		};

		const mapping = toPgError(wrapped);

		expect(mapping.appErrorKey).toBe(APP_ERROR_KEYS.conflict);
	});

	it("ignores non-string field values when extracting metadata", () => {
		const mapping = toPgError({
			code: PG_CODES.UNIQUE_VIOLATION,
			constraint: 12_345, // not a string → must be dropped, not coerced
		});

		expect(mapping.pgErrorMetadata.constraint).toBeUndefined();
	});

	it("falls back to an unexpected mapping for an unknown code", () => {
		const mapping = toPgError({ code: "99999" });

		expect(mapping.appErrorKey).toBe(APP_ERROR_KEYS.unexpected);
		expect(mapping.pgCondition).toBe(PG_CONDITIONS.pg_unexpected_error);
		expect(mapping.pgErrorMetadata.pgCode).toBe(
			PG_CODES.UNEXPECTED_INTERNAL_ERROR,
		);
	});

	it("falls back for an Error with no code, keeping its message as detail", () => {
		const mapping = toPgError(new Error("connection refused"));

		expect(mapping.appErrorKey).toBe(APP_ERROR_KEYS.unexpected);
		expect(mapping.pgErrorMetadata.detail).toBe("connection refused");
	});

	it.each([
		null,
		undefined,
		"raw string",
		7,
	])("falls back to unexpected for non-object input %p", (input) => {
		expect(toPgError(input).appErrorKey).toBe(APP_ERROR_KEYS.unexpected);
	});
});
