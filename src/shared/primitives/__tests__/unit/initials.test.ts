import { describe, expect, it } from "vitest";
import { toInitials } from "@/shared/primitives/text/initials";

describe("toInitials", () => {
	it("takes the first letter of the first and last word", () => {
		expect(toInitials("Amy Burns")).toBe("AB");
	});

	it("skips middle words — first and last are the distinguishing ones", () => {
		expect(toInitials("Evil Rabbits Incorporated")).toBe("EI");
	});

	it("returns a single initial for a one-word name", () => {
		expect(toInitials("Delba")).toBe("D");
	});

	it("uppercases a lowercase name", () => {
		expect(toInitials("lee robinson")).toBe("LR");
	});

	it("collapses extra whitespace instead of producing blank initials", () => {
		expect(toInitials("  Amy   Burns  ")).toBe("AB");
	});

	it("falls back to ? for an empty or whitespace-only name", () => {
		expect(toInitials("")).toBe("?");
		expect(toInitials("   ")).toBe("?");
	});

	it("keeps a whole astral-plane character rather than half a surrogate pair", () => {
		// "🦊"[0] is a lone high surrogate and renders as a replacement glyph;
		// iterating by code point is what avoids that.
		expect(toInitials("🦊 Fox")).toBe("🦊F");
	});

	it("never returns more than two initials", () => {
		expect(toInitials("Ada Grace Byron King Lovelace")).toHaveLength(2);
	});
});
