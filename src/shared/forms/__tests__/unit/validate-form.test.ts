import { buildFormData } from "@test-support/forms/form-data";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { validateForm } from "@/shared/forms/server/validate-form";

vi.mock(
	"@/shared/telemetry/logging/infrastructure/logging.client",
	async () => {
		const { makeMockLogger } = await import("@test-support/mocks/logger.mock");
		return { logger: makeMockLogger() };
	},
);

/**
 * Unit tests for the validation funnel (validate-form.ts).
 *
 * `validateForm` is the intended single entry point from FormData to a
 * FormResult (BACKLOG: "One validation funnel"). Pinned: the ok path with
 * default and custom messages, dense field errors on failure, the verbatim
 * echo of submitted values — including passwords — into error metadata
 * (BACKLOG: "Stop echoing sensitive fields"), and the unknown-error path for
 * throwing refinements.
 */
describe("validateForm", () => {
	const schema = z.object({
		email: z.string().min(3, "Email is too short."),
		password: z.string().min(8, "Password is too short."),
	});

	it("returns ok with parsed data and the default success message", async () => {
		const formData = buildFormData({
			email: "a@b.c",
			password: "longenough",
		});

		const result = await validateForm(formData, schema);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.data).toEqual({
				email: "a@b.c",
				password: "longenough",
			});
			expect(result.value.message).toBe("Action completed successfully.");
		}
	});

	it("returns dense field errors and the default failure message", async () => {
		const formData = buildFormData({ email: "a@b.c", password: "short" });

		const result = await validateForm(formData, schema);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.key).toBe("validation");
			expect(result.error.message).toBe(
				"There were errors with your submission.",
			);
			expect(result.error.metadata).toEqual(
				expect.objectContaining({
					fieldErrors: { email: [], password: ["Password is too short."] },
				}),
			);
		}
	});

	it("echoes every submitted value into metadata — including the password", async () => {
		// Same-user echo, but still hygiene: BACKLOG "Stop echoing sensitive
		// fields" wants an allowlist here. Pinned as-is until then.
		const formData = buildFormData({
			email: "a@b.c",
			password: "hunter2",
		});

		const result = await validateForm(formData, schema);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.metadata).toEqual(
				expect.objectContaining({
					formData: { email: "a@b.c", password: "hunter2" },
				}),
			);
		}
	});

	it("uses custom messages when provided", async () => {
		const ok = await validateForm(
			buildFormData({ email: "a@b.c", password: "longenough" }),
			schema,
			undefined,
			{ messages: { successMessage: "Welcome!" } },
		);
		const err = await validateForm(
			buildFormData({ email: "a@b.c", password: "x" }),
			schema,
			undefined,
			{ messages: { failureMessage: "Check the form." } },
		);

		expect(ok.ok).toBe(true);
		if (ok.ok) {
			expect(ok.value.message).toBe("Welcome!");
		}
		expect(err.ok).toBe(false);
		if (!err.ok) {
			expect(err.error.message).toBe("Check the form.");
		}
	});

	it("validates an explicit raw payload instead of the FormData", async () => {
		const result = await validateForm(buildFormData({}), schema, undefined, {
			raw: { email: "a@b.c", password: "longenough" },
		});

		expect(result.ok).toBe(true);
	});

	it("maps a throwing refinement to a validation failure with empty field errors", async () => {
		const throwing = schema.refine(() => {
			throw new Error("refinement exploded");
		});

		const result = await validateForm(
			buildFormData({ email: "a@b.c", password: "longenough" }),
			throwing,
		);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.key).toBe("validation");
			expect(result.error.metadata).toEqual(
				expect.objectContaining({
					fieldErrors: { email: [], password: [] },
				}),
			);
		}
	});
});
