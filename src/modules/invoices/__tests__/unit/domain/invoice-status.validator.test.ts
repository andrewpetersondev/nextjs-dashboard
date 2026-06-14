import { describe, expect, it } from "vitest";
import { validateInvoiceStatus } from "@/modules/invoices/domain/invoice-status.validator";
import { isAppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";

/**
 * Characterization tests for the invoice-status enum validator.
 * Allowed values are exactly "pending" and "paid".
 */
describe("validateInvoiceStatus", () => {
	it.each([
		"pending",
		"paid",
	] as const)("accepts the valid status %j", (status) => {
		const result = validateInvoiceStatus(status);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toBe(status);
		}
	});

	it("rejects an unknown status string with a validation AppError", () => {
		const result = validateInvoiceStatus("cancelled");

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(isAppError(result.error)).toBe(true);
			expect(result.error.key).toBe(APP_ERROR_KEYS.validation);
			expect(result.error.message).toContain("cancelled");
		}
	});

	it("is case-sensitive (rejects 'Paid')", () => {
		expect(validateInvoiceStatus("Paid").ok).toBe(false);
	});

	it.each([
		["a number", 1],
		["null", null],
		["undefined", undefined],
		["an object", {}],
	])("rejects non-string input: %s", (_label, input) => {
		const result = validateInvoiceStatus(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.key).toBe(APP_ERROR_KEYS.validation);
			expect(result.error.message).toContain("expected string");
		}
	});
});
