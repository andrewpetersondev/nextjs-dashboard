import { describe, expect, it } from "vitest";
import type { AppErrorLike } from "@/shared/core/errors/core/app-error.dto";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { toFormErrorPayload } from "@/shared/forms/presentation/mappers/form-error-payload.mapper";

/**
 * Unit tests for the form error payload mapper (form-error-payload.mapper.ts).
 *
 * `toFormErrorPayload` is the single mapper that adapts an AppError for the
 * form UI. The earlier `formErrorPayloadMapper` variant — which synthesized a
 * form-level error from `error.message` when none was present — was removed in
 * the "Form error payload overlap" consolidation (BACKLOG). The key behavior
 * that replaced it is pinned here: a non-form error yields `formErrors: []`,
 * never `[error.message]`.
 */
describe("form-error payload mapper", () => {
	const validationError = makeAppError("validation", {
		cause: "test",
		message: "There were errors.",
		metadata: {
			fieldErrors: { email: ["Required"] },
			formData: { email: "a@b.c" },
			formErrors: ["Fix the fields below."],
		},
	});

	const nonFormError: AppErrorLike = {
		key: "not_found",
		message: "Nothing here.",
		metadata: {},
	};

	describe("toFormErrorPayload", () => {
		it("maps a validation error onto message, field errors, form errors, and echoed data", () => {
			expect(toFormErrorPayload(validationError)).toEqual({
				fieldErrors: { email: ["Required"] },
				formData: { email: "a@b.c" },
				formErrors: ["Fix the fields below."],
				message: "There were errors.",
			});
		});

		it("builds an empty dense map from the fields list for a non-form error", () => {
			const payload = toFormErrorPayload(nonFormError, ["email", "password"]);

			expect(payload.fieldErrors).toEqual({ email: [], password: [] });
			expect(payload.formErrors).toEqual([]);
			expect(payload.message).toBe("Nothing here.");
		});

		it("falls back to a frozen empty map when no fields are provided", () => {
			const payload = toFormErrorPayload(nonFormError);

			expect(payload.fieldErrors).toEqual({});
			expect(Object.isFrozen(payload.fieldErrors)).toBe(true);
			expect(payload.formData).toEqual({});
		});

		it("never synthesizes a form-level error from the message (no [error.message] fallback)", () => {
			// The removed formErrorPayloadMapper substituted [error.message]
			// here; the single mapper surfaces only what the error carries, so a
			// non-form error has no form-level errors.
			expect(toFormErrorPayload(nonFormError).formErrors).toEqual([]);
		});
	});
});
