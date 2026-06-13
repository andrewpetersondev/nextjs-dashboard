import { describe, expect, it } from "vitest";
import type { AppErrorLike } from "@/shared/core/errors/core/app-error.dto";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";
import { isFormValidationError } from "@/shared/forms/core/guards/form-result.guard";

/**
 * Unit tests for the form result guard (form-result.guard.ts).
 *
 * `isFormValidationError` is the single live guard. It is key-AGNOSTIC: it
 * accepts any AppError (entity or DTO) whose metadata structurally carries a
 * `fieldErrors` property, regardless of `error.key`. An error without a
 * `fieldErrors` property still fails the guard.
 */
describe("isFormValidationError", () => {
	const formMetadata = {
		fieldErrors: { email: ["Required"] },
		formData: {},
		formErrors: [],
	} as const;

	it("accepts a validation-keyed entity carrying fieldErrors", () => {
		const error = makeAppError("validation", {
			cause: "test",
			message: "m",
			metadata: formMetadata,
		});

		expect(isFormValidationError(error)).toBe(true);
	});

	it("accepts the serialized DTO of the same error", () => {
		const error = makeAppError("validation", {
			cause: "test",
			message: "m",
			metadata: formMetadata,
		});

		expect(isFormValidationError(error.toDto())).toBe(true);
	});

	it("rejects a validation-keyed error without a fieldErrors property", () => {
		const error = makeAppError("validation", {
			cause: "test",
			message: "m",
			metadata: { reason: "x" },
		});

		expect(isFormValidationError(error)).toBe(false);
	});

	it("accepts a conflict-keyed error that carries form metadata", () => {
		const error: AppErrorLike = {
			key: "conflict",
			message: "Email already exists.",
			metadata: formMetadata,
		};

		expect(isFormValidationError(error)).toBe(true);
	});

	it("rejects a conflict-keyed error without a fieldErrors property", () => {
		const error: AppErrorLike = {
			key: "conflict",
			message: "duplicate key",
			metadata: { pgCode: "23505" },
		};

		expect(isFormValidationError(error)).toBe(false);
	});
});
