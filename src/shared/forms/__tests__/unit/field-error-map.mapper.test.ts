import { describe, expect, it } from "vitest";
import {
	makeEmptyDenseFieldErrorMap,
	selectSparseFieldErrors,
	toDenseFieldErrorMap,
} from "@/shared/forms/logic/mappers/field-error-map.mapper";

/**
 * Unit tests for the field error map mapper (field-error-map.mapper.ts).
 *
 * Dense maps (every field present) are what the UI consumes; sparse maps are
 * what Zod produces. These tests pin the conversions: filling, filtering to
 * allowed fields, dropping empty arrays, and freezing every result.
 */
describe("field-error-map mapper", () => {
	describe("makeEmptyDenseFieldErrorMap", () => {
		it("maps every field to an empty array", () => {
			expect(makeEmptyDenseFieldErrorMap(["email", "password"])).toEqual({
				email: [],
				password: [],
			});
		});

		it("freezes the map and its arrays", () => {
			const map = makeEmptyDenseFieldErrorMap(["email"]);

			expect(Object.isFrozen(map)).toBe(true);
			expect(Object.isFrozen(map.email)).toBe(true);
		});
	});

	describe("toDenseFieldErrorMap", () => {
		it("returns an empty dense map when the sparse map is undefined", () => {
			expect(toDenseFieldErrorMap(undefined, ["email", "password"])).toEqual({
				email: [],
				password: [],
			});
		});

		it("fills missing fields with empty arrays and copies present ones", () => {
			const dense = toDenseFieldErrorMap({ email: ["Required"] }, [
				"email",
				"password",
			]);

			expect(dense).toEqual({ email: ["Required"], password: [] });
		});

		it("drops sparse keys that are not in the allowed fields", () => {
			const dense = toDenseFieldErrorMap(
				{ email: ["Required"] } as Record<string, ["Required"]>,
				["password"],
			);

			expect(dense).toEqual({ password: [] });
		});

		it("freezes the map and copies arrays instead of sharing them", () => {
			const source = ["Required"] as const;

			const dense = toDenseFieldErrorMap({ email: source }, ["email"]);

			expect(Object.isFrozen(dense)).toBe(true);
			expect(Object.isFrozen(dense.email)).toBe(true);
			expect(dense.email).not.toBe(source);
		});
	});

	describe("selectSparseFieldErrors", () => {
		it("keeps only allowed fields that have non-empty errors", () => {
			const sparse = selectSparseFieldErrors(
				{
					email: ["Required"],
					ignored: ["Nope"],
					password: [],
				},
				["email", "password"],
			);

			expect(sparse).toEqual({ email: ["Required"] });
		});

		it("returns an empty frozen map when nothing matches", () => {
			const sparse = selectSparseFieldErrors({}, ["email"]);

			expect(sparse).toEqual({});
			expect(Object.isFrozen(sparse)).toBe(true);
		});

		it("ignores undefined entries", () => {
			const sparse = selectSparseFieldErrors({ email: undefined }, ["email"]);

			expect(sparse).toEqual({});
		});
	});
});
