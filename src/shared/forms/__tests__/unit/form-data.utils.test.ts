import { buildFormData } from "@test-support/forms/form-data";
import { describe, expect, it } from "vitest";
import { resolveRawFieldPayload } from "@/shared/forms/server/utils/form-data.utils";

/**
 * Unit tests for the FormData utils (form-data.utils.ts).
 *
 * `resolveRawFieldPayload` builds the raw payload validation sees: an explicit
 * raw map wins when non-empty, otherwise the allowed fields are picked out of
 * the FormData. Missing fields stay absent (sparse), values are stringified.
 */
describe("resolveRawFieldPayload", () => {
	it("extracts only the allowed fields from FormData", () => {
		const formData = buildFormData({
			email: "a@b.c",
			ignored: "nope",
			password: "secret",
		});

		const raw = resolveRawFieldPayload(formData, ["email", "password"]);

		expect(raw).toEqual({ email: "a@b.c", password: "secret" });
	});

	it("omits fields missing from the FormData instead of filling them", () => {
		const formData = buildFormData({ email: "a@b.c" });

		const raw = resolveRawFieldPayload(formData, ["email", "password"]);

		expect(raw).toEqual({ email: "a@b.c" });
		expect(Object.isFrozen(raw)).toBe(true);
	});

	it("prefers a non-empty explicit raw map and stringifies its values", () => {
		const formData = buildFormData({ amount: "ignored" });

		const raw = resolveRawFieldPayload(formData, ["amount", "memo"], {
			amount: 42,
		});

		expect(raw).toEqual({ amount: "42" });
	});

	it("skips null and undefined values in the explicit raw map", () => {
		const formData = buildFormData({});

		const raw = resolveRawFieldPayload(formData, ["amount", "memo"], {
			amount: null as unknown as string,
			memo: "note",
		});

		expect(raw).toEqual({ memo: "note" });
	});

	it("falls back to FormData when the explicit raw map is empty", () => {
		const formData = buildFormData({ email: "a@b.c" });

		const raw = resolveRawFieldPayload(formData, ["email"], {});

		expect(raw).toEqual({ email: "a@b.c" });
	});
});
