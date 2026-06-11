import { describe, expect, it } from "vitest";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import {
	makeFormError,
	makeFormOk,
	toFormErrResult,
} from "@/shared/forms/logic/factories/form-result.factory";

/**
 * Unit tests for the form result factory (form-result.factory.ts).
 *
 * Form results cross the Server Action boundary via `useActionState`, so the
 * error side must be a plain serialized DTO — never an `AppError` instance
 * (PR #41). These tests pin the serialization, the frozen shapes, and the fact
 * that `makeFormError` stamps form metadata onto whatever key it is given.
 */
describe("form-result factory", () => {
	describe("makeFormOk", () => {
		it("wraps data and message as a success payload", () => {
			const result = makeFormOk({ id: 1 }, "Saved.");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toEqual({ data: { id: 1 }, message: "Saved." });
			}
		});

		it("freezes the payload", () => {
			const result = makeFormOk("data", "ok");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(Object.isFrozen(result.value)).toBe(true);
			}
		});
	});

	describe("toFormErrResult", () => {
		it("serializes the AppError into a plain DTO, not the class instance", () => {
			const error = makeAppError("validation", {
				cause: "test",
				message: "bad input",
				metadata: {
					fieldErrors: { email: ["Required"] },
					formData: {},
					formErrors: [],
				},
			});

			const result = toFormErrResult(error);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).not.toBeInstanceOf(Error);
				expect(result.error._isAppError).toBe(true);
				expect(result.error.key).toBe("validation");
				expect(result.error.message).toBe("bad input");
			}
		});

		it("returns a frozen result", () => {
			const error = makeAppError("validation", {
				cause: "test",
				message: "m",
				metadata: { fieldErrors: {}, formData: {}, formErrors: [] },
			});

			expect(Object.isFrozen(toFormErrResult(error))).toBe(true);
		});
	});

	describe("makeFormError", () => {
		it("carries field errors, echoed form data, and form errors in metadata", () => {
			const result = makeFormError({
				fieldErrors: { email: ["Required"], password: [] },
				formData: { email: "a@b.c" },
				formErrors: ["Fix the fields below."],
				key: "validation",
				message: "There were errors.",
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.key).toBe("validation");
				expect(result.error.message).toBe("There were errors.");
				expect(result.error.metadata).toEqual({
					fieldErrors: { email: ["Required"], password: [] },
					formData: { email: "a@b.c" },
					formErrors: ["Fix the fields below."],
				});
			}
		});

		it("stamps form metadata onto a conflict key too (e.g. duplicate email)", () => {
			const result = makeFormError({
				fieldErrors: { email: ["Email already exists."] },
				formData: { email: "taken@b.c" },
				formErrors: [],
				key: "conflict",
				message: "Email already exists.",
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.key).toBe("conflict");
				expect(result.error.metadata).toEqual(
					expect.objectContaining({
						fieldErrors: { email: ["Email already exists."] },
					}),
				);
			}
		});
	});
});
