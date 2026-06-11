import { describe, expect, it } from "vitest";
import type { AppErrorLike } from "@/shared/core/errors/core/app-error.dto";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import {
	formErrorPayloadMapper,
	toFormErrorPayload,
} from "@/shared/forms/presentation/mappers/form-error-payload.mapper";

/**
 * Unit tests for the form error payload mapper (form-error-payload.mapper.ts).
 *
 * Two overlapping exports adapt an AppError for the form UI. Production code
 * uses only `toFormErrorPayload`; `formErrorPayloadMapper` differs in its
 * form-error fallback (`[error.message]`). Both behaviors are pinned so the
 * planned consolidation (BACKLOG: "Form error payload overlap") is a
 * deliberate change, not an accident.
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
	});

	describe("formErrorPayloadMapper", () => {
		it("matches toFormErrorPayload for a validation error with form errors", () => {
			expect(formErrorPayloadMapper(validationError)).toEqual(
				toFormErrorPayload(validationError),
			);
		});

		it("falls back to [error.message] when there are no form errors (divergence)", () => {
			// toFormErrorPayload returns [] here; the mapper substitutes the
			// message — the behavioral difference behind the overlap TODO.
			const payload = formErrorPayloadMapper(nonFormError);

			expect(payload.formErrors).toEqual(["Nothing here."]);
			expect(toFormErrorPayload(nonFormError).formErrors).toEqual([]);
		});

		it("never builds a dense map — non-form errors get an empty fieldErrors object", () => {
			expect(formErrorPayloadMapper(nonFormError).fieldErrors).toEqual({});
		});
	});
});
