import { describe, expect, it } from "vitest";
import { makeUnexpectedError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok, unwrapOrNull } from "@/shared/core/result/result";

/**
 * Unit tests for the live Result API (`result.ts`).
 *
 * Result is the foundational success/error wrapper threaded through form
 * factories, env access, DAL adapters, services and use-cases. The exported
 * surface is intentionally tiny — `Ok`, `Err`, `unwrapOrNull` — after the unused
 * combinator helpers were removed. These tests pin the three things callers
 * depend on: construction shape, immutability, and unwrap semantics.
 */
describe("Result core", () => {
	describe("Ok", () => {
		it("wraps a value as a success result", () => {
			const result = Ok(42);

			expect(result).toEqual({ ok: true, value: 42 });
		});

		it("preserves the exact value reference for objects", () => {
			const payload = { id: 1 };

			const result = Ok(payload);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(payload);
			}
		});

		it.each([
			0,
			"",
			null,
			undefined,
			false,
			Number.NaN,
		])("wraps falsy value %p without coercion", (value) => {
			const result = Ok(value);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(value);
			}
		});

		it("returns a frozen object (immutable result)", () => {
			expect(Object.isFrozen(Ok(1))).toBe(true);
		});
	});

	describe("Err", () => {
		it("wraps an error as a failure result, preserving the instance", () => {
			const error = makeUnexpectedError(new Error("boom"), {
				message: "boom",
			});

			const result = Err(error);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBe(error);
			}
		});

		it("returns a frozen object (immutable result)", () => {
			const error = makeUnexpectedError(new Error("boom"), {
				message: "boom",
			});

			expect(Object.isFrozen(Err(error))).toBe(true);
		});
	});

	describe("unwrapOrNull", () => {
		it("returns the value for an Ok result", () => {
			expect(unwrapOrNull(Ok("hello"))).toBe("hello");
		});

		it("returns null for an Err result", () => {
			const error = makeUnexpectedError(new Error("boom"), {
				message: "boom",
			});

			expect(unwrapOrNull(Err(error))).toBeNull();
		});

		it("returns null for Ok(null) — null value is indistinguishable from absence", () => {
			expect(unwrapOrNull(Ok(null))).toBeNull();
		});

		it("returns falsy-but-present values unchanged (not collapsed to null)", () => {
			expect(unwrapOrNull(Ok(0))).toBe(0);
			expect(unwrapOrNull(Ok(""))).toBe("");
			expect(unwrapOrNull(Ok(false))).toBe(false);
		});
	});
});
