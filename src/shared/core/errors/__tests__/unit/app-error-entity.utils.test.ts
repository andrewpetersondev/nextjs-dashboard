import { describe, expect, it, vi } from "vitest";
import {
	deepFreeze,
	validateAndMaybeSanitizeMetadata,
} from "@/shared/core/errors/utils/app-error-entity.utils";

/**
 * Unit tests for the AppError entity utilities (app-error-entity.utils.ts).
 *
 * deepFreeze enforces the "errors are immutable" guarantee recursively;
 * validateAndMaybeSanitizeMetadata validates metadata against its registry
 * schema, then deterministically sorts keys and redacts non-serializable values
 * so the result is always safe to freeze and log.
 */
describe("deepFreeze", () => {
	it.each([
		42,
		"x",
		true,
		null,
		undefined,
	])("returns primitive %p unchanged", (value) => {
		expect(deepFreeze(value)).toBe(value);
	});

	it("deep-freezes nested objects and returns the same reference", () => {
		const obj = { a: 1, nested: { b: 2 } };

		const result = deepFreeze(obj);

		expect(result).toBe(obj);
		expect(Object.isFrozen(obj)).toBe(true);
		expect(Object.isFrozen(obj.nested)).toBe(true);
	});

	it("returns an already-frozen object untouched", () => {
		const frozen = Object.freeze({ a: 1 });

		expect(deepFreeze(frozen)).toBe(frozen);
	});

	it("handles circular references without infinite recursion", () => {
		const circular: Record<string, unknown> = { a: 1 };
		circular.self = circular;

		expect(() => deepFreeze(circular)).not.toThrow();
		expect(Object.isFrozen(circular)).toBe(true);
	});
});

describe("validateAndMaybeSanitizeMetadata", () => {
	it("passes valid metadata through with keys sorted deterministically", () => {
		// Built in non-alphabetical insertion order to prove the function re-sorts.
		const input: Record<string, string> = {};
		input.reason = "b";
		input.policy = "a";

		const out = validateAndMaybeSanitizeMetadata("unknown", input);

		expect(Object.keys(out)).toEqual(["policy", "reason"]);
		expect(out).toEqual({ policy: "a", reason: "b" });
	});

	it("redacts non-serializable values (bigint becomes a string)", () => {
		const out = validateAndMaybeSanitizeMetadata("unknown", { count: 5n });

		expect(out).toEqual({ count: "5" });
	});

	it("is resilient: logs and returns the sanitized original when validation fails", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);

		// missing_fields uses the validation schema, where `field` must be a string.
		const out = validateAndMaybeSanitizeMetadata("missing_fields", {
			field: 123,
		});

		expect(out).toEqual({ field: 123 });
		expect(spy).toHaveBeenCalledTimes(1);

		spy.mockRestore();
	});
});
