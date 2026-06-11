import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { formValidationErrorFactory } from "@/shared/forms/server/factories/form-validation-error.factory";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

vi.mock(
	"@/shared/telemetry/logging/infrastructure/logging.client",
	async () => {
		const { makeMockLogger } = await import("@test-support/mocks/logger.mock");
		return { logger: makeMockLogger() };
	},
);

/**
 * Unit tests for the validation error factory (form-validation-error.factory.ts).
 *
 * The factory is the single funnel from "validation failed somehow" to a
 * validation-keyed FormResult: ZodErrors map to dense field errors, anything
 * else maps to an empty dense map, and every failure is logged. The submitted
 * form data is echoed into metadata verbatim (BACKLOG: "Stop echoing
 * sensitive fields").
 */
describe("formValidationErrorFactory", () => {
	beforeEach(() => {
		vi.mocked(logger.error).mockClear();
	});

	function makeZodError(): z.ZodError {
		const parsed = z
			.object({ email: z.string().min(3, "Email is too short.") })
			.safeParse({ email: "x" });
		if (parsed.success) {
			throw new Error("expected parse to fail");
		}
		return parsed.error;
	}

	it("maps a ZodError to dense field errors under the validation key", () => {
		const result = formValidationErrorFactory(makeZodError(), "TestContext", {
			failureMessage: "Failed.",
			fields: ["email", "password"],
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.key).toBe("validation");
			expect(result.error.message).toBe("Failed.");
			expect(result.error.metadata).toEqual(
				expect.objectContaining({
					fieldErrors: { email: ["Email is too short."], password: [] },
				}),
			);
		}
	});

	it("maps a non-Zod error to an empty dense map", () => {
		const result = formValidationErrorFactory(
			new Error("boom"),
			"TestContext",
			{
				failureMessage: "Failed.",
				fields: ["email"],
			},
		);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.metadata).toEqual(
				expect.objectContaining({ fieldErrors: { email: [] }, formErrors: [] }),
			);
		}
	});

	it("echoes the provided form data into metadata verbatim", () => {
		const result = formValidationErrorFactory(makeZodError(), "TestContext", {
			failureMessage: "Failed.",
			fields: ["email"],
			formData: { email: "typed-by-user" },
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.metadata).toEqual(
				expect.objectContaining({ formData: { email: "typed-by-user" } }),
			);
		}
	});

	it("defaults the echoed form data to a frozen empty map", () => {
		const result = formValidationErrorFactory(makeZodError(), "TestContext", {
			failureMessage: "Failed.",
			fields: ["email"],
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.metadata).toEqual(
				expect.objectContaining({ formData: {} }),
			);
		}
	});

	it("logs every failure with the logger context", () => {
		formValidationErrorFactory(makeZodError(), "TestContext", {
			failureMessage: "Failed.",
			fields: ["email"],
		});

		expect(logger.error).toHaveBeenCalledTimes(1);
		expect(logger.error).toHaveBeenCalledWith(
			"Failed.",
			expect.objectContaining({ context: "TestContext" }),
		);
	});

	it("labels non-Zod errors as UnknownValidationError in the log", () => {
		formValidationErrorFactory({ weird: true }, "TestContext", {
			failureMessage: "Failed.",
			fields: ["email"],
		});

		expect(logger.error).toHaveBeenCalledWith(
			"Failed.",
			expect.objectContaining({ name: "UnknownValidationError" }),
		);
	});
});
