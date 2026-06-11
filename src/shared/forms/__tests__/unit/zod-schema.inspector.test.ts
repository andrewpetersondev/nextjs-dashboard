import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	resolveCanonicalFieldNames,
	toSchemaKeys,
} from "@/shared/forms/logic/inspectors/zod-schema.inspector";

/**
 * Unit tests for the Zod schema inspector (zod-schema.inspector.ts).
 *
 * Field names drive everything downstream (dense maps, echo payloads), so the
 * resolution priority — explicit list, then allowed subset, then schema keys,
 * then empty — is pinned, including the quirk that empty arrays are treated
 * as absent.
 */
describe("zod-schema inspector", () => {
	const schema = z.object({
		email: z.string(),
		password: z.string(),
	});

	describe("toSchemaKeys", () => {
		it("derives the keys of an object schema", () => {
			expect(toSchemaKeys(schema)).toEqual(["email", "password"]);
		});

		it("returns a frozen array", () => {
			expect(Object.isFrozen(toSchemaKeys(schema))).toBe(true);
		});
	});

	describe("resolveCanonicalFieldNames", () => {
		it("prefers the explicit field list over everything else", () => {
			const fields = resolveCanonicalFieldNames(
				schema,
				["password"],
				["email"],
			);

			expect(fields).toEqual(["email"]);
		});

		it("falls back to the allowed subset when no explicit list is given", () => {
			expect(resolveCanonicalFieldNames(schema, ["password"])).toEqual([
				"password",
			]);
		});

		it("derives fields from the object schema when no lists are given", () => {
			expect(resolveCanonicalFieldNames(schema)).toEqual(["email", "password"]);
		});

		it("treats empty lists as absent and keeps falling through", () => {
			expect(resolveCanonicalFieldNames(schema, [], [])).toEqual([
				"email",
				"password",
			]);
		});

		it("returns a frozen empty array for a non-object schema", () => {
			const fields = resolveCanonicalFieldNames(z.string());

			expect(fields).toEqual([]);
			expect(Object.isFrozen(fields)).toBe(true);
		});
	});
});
