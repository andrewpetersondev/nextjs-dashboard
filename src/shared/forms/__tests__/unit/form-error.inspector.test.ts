import { describe, expect, it } from "vitest";
import type { AppErrorLike } from "@/shared/core/errors/core/app-error.dto";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import {
	extractFieldErrors,
	extractFieldValues,
	extractFormErrors,
} from "@/shared/forms/logic/inspectors/form-error.inspector";

/**
 * Unit tests for the form error inspector (form-error.inspector.ts).
 *
 * The inspectors read form metadata back out of an AppError (entity or
 * serialized DTO). They are key-AGNOSTIC: any error whose metadata
 * structurally carries `fieldErrors` is treated as a form error, so
 * `validation`, `conflict`, and any other metadata-carrying key all
 * round-trip their field errors, echoed values, and form-level errors
 * identically. A `validation`/`conflict` error WITHOUT a `fieldErrors`
 * property still yields undefined / frozen [].
 */
describe("form-error inspector", () => {
	const formMetadata = {
		fieldErrors: { email: ["Required"] },
		formData: { email: "a@b.c" },
		formErrors: ["Fix the fields below."],
	} as const;

	const validationError = makeAppError("validation", {
		cause: "test",
		message: "There were errors.",
		metadata: formMetadata,
	});

	// Mirrors production (to-signup-form-result.mapper): a conflict form error
	// carries the form fields plus the bare pg code — never raw pg metadata
	// (detail/table/schema/constraint stay server-side on the cause chain).
	const conflictError = makeAppError("conflict", {
		cause: "test",
		message: "Email already exists.",
		metadata: { ...formMetadata, pgCode: "23505" },
	});

	// Built structurally: a database-keyed form error never survives entity
	// metadata validation in tests, but the boundary type (AppErrorLike) admits
	// it — and that is exactly the shape the extractors mishandle.
	const databaseFormError: AppErrorLike = {
		key: "database",
		message: "insert failed",
		metadata: formMetadata,
	};

	describe("extractFieldErrors", () => {
		it("returns field errors for a validation-keyed entity", () => {
			expect(extractFieldErrors(validationError)).toEqual({
				email: ["Required"],
			});
		});

		it("returns field errors for the serialized DTO of the same error", () => {
			expect(extractFieldErrors(validationError.toDto())).toEqual({
				email: ["Required"],
			});
		});

		it("returns field errors for a conflict-keyed form error", () => {
			expect(extractFieldErrors(conflictError)).toEqual({
				email: ["Required"],
			});
		});

		it("returns field errors for a database-keyed form error (structural read)", () => {
			expect(extractFieldErrors(databaseFormError)).toEqual({
				email: ["Required"],
			});
		});

		it("returns undefined for a conflict error without form metadata", () => {
			const pgConflict = makeAppError("conflict", {
				cause: "test",
				message: "duplicate key",
				metadata: { pgCode: "23505" },
			});

			expect(extractFieldErrors(pgConflict)).toBeUndefined();
		});
	});

	describe("extractFieldValues", () => {
		it("returns echoed form data for a validation-keyed error", () => {
			expect(extractFieldValues(validationError)).toEqual({
				email: "a@b.c",
			});
		});

		it("returns echoed form data for a conflict-keyed form error", () => {
			expect(extractFieldValues(conflictError)).toEqual({
				email: "a@b.c",
			});
		});

		it("returns undefined when validation metadata has no fieldErrors shape", () => {
			const bare: AppErrorLike = {
				key: "validation",
				message: "m",
				metadata: { reason: "x" },
			};

			expect(extractFieldValues(bare)).toBeUndefined();
		});

		it("returns echoed form data for any metadata-carrying key (structural read)", () => {
			const notFoundForm: AppErrorLike = {
				key: "not_found",
				message: "x",
				metadata: formMetadata,
			};

			expect(extractFieldValues(notFoundForm)).toEqual({ email: "a@b.c" });
		});
	});

	describe("extractFormErrors", () => {
		it("returns form-level errors for a validation-keyed error", () => {
			expect(extractFormErrors(validationError)).toEqual([
				"Fix the fields below.",
			]);
		});

		it("returns form-level errors for a conflict-keyed form error", () => {
			expect(extractFormErrors(conflictError)).toEqual([
				"Fix the fields below.",
			]);
		});

		it("returns form-level errors for a database-keyed form error", () => {
			expect(extractFormErrors(databaseFormError)).toEqual([
				"Fix the fields below.",
			]);
		});
	});
});
