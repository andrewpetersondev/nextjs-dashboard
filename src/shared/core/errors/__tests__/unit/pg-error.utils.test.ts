import { describe, expect, it } from "vitest";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { getPgConstraintFromAppError } from "@/shared/core/errors/server/adapters/postgres/pg-error.utils";

/**
 * Unit tests for getPgConstraintFromAppError (pg-error.utils.ts).
 *
 * Conflict messaging (e.g. "email already taken") keys off the violated pg
 * constraint name. This helper digs that name out of an AppError's pg metadata,
 * walking the AppError cause chain when the constraint lives on a wrapped error.
 */
describe("getPgConstraintFromAppError", () => {
	it("returns the constraint from direct pg metadata", () => {
		const error = makeAppError("conflict", {
			cause: "root",
			message: "pg_unique_violation",
			metadata: { constraint: "users_email_key", pgCode: "23505" },
		});

		expect(getPgConstraintFromAppError(error)).toBe("users_email_key");
	});

	it("returns undefined when pg metadata has no constraint", () => {
		const error = makeAppError("conflict", {
			cause: "root",
			message: "pg_unique_violation",
			metadata: { pgCode: "23505" },
		});

		expect(getPgConstraintFromAppError(error)).toBeUndefined();
	});

	it("returns undefined for non-pg metadata", () => {
		const error = makeAppError("validation", {
			cause: "root",
			message: "bad input",
			metadata: { reason: "too short" },
		});

		expect(getPgConstraintFromAppError(error)).toBeUndefined();
	});

	it("walks the AppError cause chain to find a wrapped constraint", () => {
		const inner = makeAppError("conflict", {
			cause: "root",
			message: "pg_unique_violation",
			metadata: { constraint: "customers_pkey", pgCode: "23505" },
		});
		const outer = makeAppError("unexpected", {
			cause: inner,
			message: "wrapped failure",
			metadata: {},
		});

		expect(getPgConstraintFromAppError(outer)).toBe("customers_pkey");
	});
});
