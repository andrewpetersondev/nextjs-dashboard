import { describe, expect, it } from "vitest";
import { isAppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { normalizePgError } from "@/shared/core/errors/server/adapters/postgres/normalize-pg-error";
import { PG_CODES } from "@/shared/core/errors/server/adapters/postgres/pg-error.constants";

/**
 * Unit tests for normalizePgError (normalize-pg-error.ts).
 *
 * This is the Postgres boundary adapter: it composes toPgError + makeAppError to
 * turn a raw driver error into a structured AppError with the right key,
 * condition message, and pg metadata.
 */
describe("normalizePgError", () => {
	it("produces a conflict AppError for a unique violation", () => {
		const error = normalizePgError({
			code: PG_CODES.UNIQUE_VIOLATION,
			constraint: "users_email_key",
		});

		expect(isAppError(error)).toBe(true);
		expect(error.key).toBe(APP_ERROR_KEYS.conflict);
		expect(error.message).toBe("pg_unique_violation");
		expect(error.metadata).toMatchObject({
			constraint: "users_email_key",
			pgCode: PG_CODES.UNIQUE_VIOLATION,
		});
	});

	it("produces an unexpected AppError for an unknown error, preserving the cause", () => {
		const cause = new Error("connection refused");

		const error = normalizePgError(cause);

		expect(error.key).toBe(APP_ERROR_KEYS.unexpected);
		expect(error.message).toBe("pg_unexpected_error");
		expect(error.metadata).toMatchObject({
			pgCode: PG_CODES.UNEXPECTED_INTERNAL_ERROR,
		});
		expect(error.cause).toBe(cause);
	});

	it("returns a frozen AppError instance", () => {
		const error = normalizePgError({ code: PG_CODES.NOT_NULL_VIOLATION });

		expect(error.key).toBe(APP_ERROR_KEYS.integrity);
		expect(Object.isFrozen(error)).toBe(true);
	});
});
