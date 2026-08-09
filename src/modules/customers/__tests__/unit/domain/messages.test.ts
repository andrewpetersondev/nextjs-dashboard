import { describe, expect, it } from "vitest";
import { customerHasInvoicesMessage } from "@/modules/customers/domain/messages";

describe("customerHasInvoicesMessage", () => {
	it("names the customer and the exact invoice count", () => {
		expect(customerHasInvoicesMessage("Amy Burns", 8)).toContain("Amy Burns");
		expect(customerHasInvoicesMessage("Amy Burns", 8)).toContain("8 invoices");
	});

	it("uses the singular for exactly one invoice", () => {
		const message = customerHasInvoicesMessage("Amy Burns", 1);

		expect(message).toContain("1 invoice ");
		expect(message).not.toContain("1 invoices");
	});

	it("tells the user what to do next", () => {
		expect(customerHasInvoicesMessage("Amy Burns", 2)).toContain(
			"Delete or reassign",
		);
	});
});
