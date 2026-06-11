import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	fromZodError,
	toDenseFieldErrorMapFromZod,
} from "@/shared/forms/server/mappers/zod-error.mapper";

/**
 * Unit tests for the Zod error mapper (zod-error.mapper.ts).
 *
 * Adapts a foreign ZodError into the canonical dense field-error map plus
 * form-level errors. Pinned: density over the allowed fields, dropping of
 * unknown fields, and root issues landing in formErrors.
 */
describe("zod-error mapper", () => {
	const schema = z.object({
		email: z.string().min(3, "Email is too short."),
		password: z.string().min(8, "Password is too short."),
	});

	function failParse(input: Record<string, string>): z.ZodError {
		const parsed = schema.safeParse(input);
		if (parsed.success) {
			throw new Error("expected parse to fail");
		}
		return parsed.error;
	}

	describe("fromZodError", () => {
		it("produces a dense map over the allowed fields", () => {
			const error = failParse({ email: "a@b.c", password: "short" });

			const { fieldErrors, formErrors } = fromZodError(error, [
				"email",
				"password",
			]);

			expect(fieldErrors).toEqual({
				email: [],
				password: ["Password is too short."],
			});
			expect(formErrors).toEqual([]);
		});

		it("drops issues for fields outside the allowed list", () => {
			const error = failParse({ email: "x", password: "short" });

			const { fieldErrors } = fromZodError(error, ["email"]);

			expect(fieldErrors).toEqual({ email: ["Email is too short."] });
		});

		it("routes root-level issues into formErrors", () => {
			const refined = schema.refine(() => false, "Form is invalid.");
			const parsed = refined.safeParse({
				email: "a@b.c",
				password: "longenough",
			});
			if (parsed.success) {
				throw new Error("expected parse to fail");
			}

			const { fieldErrors, formErrors } = fromZodError(parsed.error, [
				"email",
				"password",
			]);

			expect(formErrors).toEqual(["Form is invalid."]);
			expect(fieldErrors).toEqual({ email: [], password: [] });
		});
	});

	describe("toDenseFieldErrorMapFromZod", () => {
		it("returns only the dense field-error map", () => {
			const error = failParse({ email: "x", password: "short" });

			expect(toDenseFieldErrorMapFromZod(error, ["email", "password"])).toEqual(
				{
					email: ["Email is too short."],
					password: ["Password is too short."],
				},
			);
		});
	});
});
