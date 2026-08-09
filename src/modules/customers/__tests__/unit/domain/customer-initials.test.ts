import { describe, expect, it } from "vitest";
import { toCustomerInitials } from "@/modules/customers/domain/customer-initials";

describe("toCustomerInitials", () => {
	it("takes the first letter of the first and last word", () => {
		expect(toCustomerInitials("Amy Burns")).toBe("AB");
	});

	it("skips middle words — first and last are the distinguishing ones", () => {
		expect(toCustomerInitials("Evil Rabbits Incorporated")).toBe("EI");
	});

	it("returns a single initial for a one-word name", () => {
		expect(toCustomerInitials("Delba")).toBe("D");
	});

	it("uppercases a lowercase name", () => {
		expect(toCustomerInitials("lee robinson")).toBe("LR");
	});

	it("collapses extra whitespace instead of producing blank initials", () => {
		expect(toCustomerInitials("  Amy   Burns  ")).toBe("AB");
	});

	it("falls back to ? for an empty or whitespace-only name", () => {
		expect(toCustomerInitials("")).toBe("?");
		expect(toCustomerInitials("   ")).toBe("?");
	});

	it("keeps a whole astral-plane character rather than half a surrogate pair", () => {
		// "🦊"[0] is a lone high surrogate and renders as a replacement glyph;
		// iterating by code point is what avoids that.
		expect(toCustomerInitials("🦊 Fox")).toBe("🦊F");
	});

	it("never returns more than two initials", () => {
		expect(toCustomerInitials("Ada Grace Byron King Lovelace")).toHaveLength(2);
	});
});
