import { describe, expect, it } from "vitest";
import { redactNonSerializable } from "@/shared/core/errors/utils/serialization";

/**
 * Unit tests for redactNonSerializable (serialization.ts).
 *
 * This is the safety net that keeps error metadata loggable: primitives pass
 * through, BigInt/Date/Error get normalized, JSON-safe objects are returned
 * untouched, and anything that can't be serialized is replaced with a small
 * descriptor so logging never throws.
 */
describe("redactNonSerializable", () => {
	it.each([
		null,
		undefined,
		"text",
		42,
		0,
		true,
		false,
	])("returns primitive %p unchanged", (value) => {
		expect(redactNonSerializable(value)).toBe(value);
	});

	it("stringifies bigint (JSON cannot represent it)", () => {
		expect(redactNonSerializable(10n)).toBe("10");
	});

	it("normalizes an Error to a plain object without a stack outside development", () => {
		const out = redactNonSerializable(new Error("boom"));

		expect(out).toMatchObject({ message: "boom", name: "Error" });
		// NODE_ENV is "test" in the unit lane → stack is intentionally omitted.
		expect((out as { stack?: unknown }).stack).toBeUndefined();
	});

	it("converts a Date to an ISO string", () => {
		const date = new Date("2026-01-02T03:04:05.000Z");

		expect(redactNonSerializable(date)).toBe("2026-01-02T03:04:05.000Z");
	});

	it("returns a JSON-serializable object by reference (fast path)", () => {
		const obj = { a: 1, nested: { b: 2 } };

		expect(redactNonSerializable(obj)).toBe(obj);
	});

	it("redacts a circular object into a descriptor instead of throwing", () => {
		const circular: Record<string, unknown> = {};
		circular.self = circular;

		const out = redactNonSerializable(circular);

		expect(out).toMatchObject({
			note: "non-serializable",
			originalType: "object",
		});
	});
});
