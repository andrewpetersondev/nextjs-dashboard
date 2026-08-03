import { describe, expect, it } from "vitest";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceStatus } from "@/modules/invoices/domain/statuses/invoice.statuses";
import {
	allowedNextInvoiceStatuses,
	canTransitionInvoiceStatus,
	validateInvoiceStatusTransition,
} from "@/modules/invoices/domain/statuses/invoice-status.transitions";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";

/**
 * Locks the FULL transition matrix: every from→to pair has an explicit
 * expected verdict, so any future lifecycle change must edit this table
 * deliberately. `from === to` is an allowed no-op by design (the edit form
 * may re-submit the current status).
 */
const MATRIX: ReadonlyArray<[InvoiceStatus, InvoiceStatus, boolean]> = [
	["pending", "pending", true],
	["pending", "paid", true],
	["pending", "void", true],
	["paid", "pending", false],
	["paid", "paid", true],
	["paid", "void", false],
	["void", "pending", false],
	["void", "paid", false],
	["void", "void", true],
];

describe("canTransitionInvoiceStatus", () => {
	it.each(MATRIX)("%s -> %s allowed: %j", (from, to, allowed) => {
		expect(canTransitionInvoiceStatus(from, to)).toBe(allowed);
	});
});

describe("allowedNextInvoiceStatuses", () => {
	it("pending can move to paid or void", () => {
		expect(allowedNextInvoiceStatuses("pending")).toEqual(["paid", "void"]);
	});

	it.each(["paid", "void"] as const)("%s is terminal", (status) => {
		expect(allowedNextInvoiceStatuses(status)).toEqual([]);
	});
});

describe("validateInvoiceStatusTransition", () => {
	it("returns the target status for a legal transition", () => {
		const result = validateInvoiceStatusTransition("pending", "paid");

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toBe("paid");
		}
	});

	it("allows the no-op re-submission of the current status", () => {
		expect(validateInvoiceStatusTransition("paid", "paid").ok).toBe(true);
	});

	it("rejects an illegal transition with the lifecycle message id", () => {
		const result = validateInvoiceStatusTransition("paid", "pending");

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.key).toBe(APP_ERROR_KEYS.validation);
			expect(result.error.message).toBe(INVOICE_MSG.invalidStatusTransition);
			expect(result.error.metadata).toMatchObject({
				policy: "invoice-status-transition",
				reason: "paid->pending",
			});
		}
	});
});
