import { describe, expect, it } from "vitest";
import { toHash } from "@/server/crypto/hashing/hashing.value";

/**
 * `toHash` is a pure branding pass-through for values already hashed by the
 * system (or read from the DB). It must not transform the string.
 */
describe("toHash", () => {
	it("returns the same string value, branded", () => {
		const raw = "$2b$10$abcdefghijklmnopqrstuv";

		expect(String(toHash(raw))).toBe(raw);
	});

	it("does not alter an empty string", () => {
		expect(String(toHash(""))).toBe("");
	});
});
