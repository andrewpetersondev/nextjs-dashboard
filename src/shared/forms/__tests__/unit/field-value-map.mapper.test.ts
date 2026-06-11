import { describe, expect, it } from "vitest";
import { selectEchoedFieldValues } from "@/shared/forms/logic/mappers/field-value-map.mapper";

/**
 * Unit tests for the echo allowlist filter (field-value-map.mapper.ts).
 *
 * `selectEchoedFieldValues` is the single primitive deciding which submitted
 * values may cross back to the client in error metadata (BACKLOG: "Stop
 * echoing sensitive fields"). Pinned: allowlist-only picking, omission of
 * absent fields, and the frozen empty result for an empty allowlist.
 */
describe("selectEchoedFieldValues", () => {
	type Field = "email" | "password" | "username";

	const values: Readonly<Partial<Record<Field, string>>> = {
		email: "a@b.c",
		password: "hunter2",
		username: "andrew",
	};

	it("picks only allowlisted fields", () => {
		const result = selectEchoedFieldValues<Field>(values, [
			"email",
			"username",
		]);

		expect(result).toEqual({ email: "a@b.c", username: "andrew" });
		expect(result).not.toHaveProperty("password");
	});

	it("returns a frozen empty map for an empty allowlist", () => {
		const result = selectEchoedFieldValues<Field>(values, []);

		expect(result).toEqual({});
		expect(Object.isFrozen(result)).toBe(true);
	});

	it("omits allowlisted fields that have no submitted value", () => {
		const result = selectEchoedFieldValues<Field>({ email: "a@b.c" }, [
			"email",
			"username",
		]);

		expect(result).toEqual({ email: "a@b.c" });
	});
});
