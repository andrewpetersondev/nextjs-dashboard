import { describe, expect, it } from "vitest";
import { evaluateCustomerDeletion } from "@/modules/customers/domain/customer-deletion.policy";

/**
 * The guard standing between a stray click and `ON DELETE CASCADE`. Its
 * boundary is exactly zero, so that is what these pin.
 */
describe("evaluateCustomerDeletion", () => {
	it("allows deleting a customer with no invoices", () => {
		expect(evaluateCustomerDeletion(0)).toEqual({ allowed: true });
	});

	it("blocks at the boundary — a single invoice is enough", () => {
		expect(evaluateCustomerDeletion(1)).toEqual({
			allowed: false,
			invoiceCount: 1,
		});
	});

	it("reports the count so the refusal can name it", () => {
		expect(evaluateCustomerDeletion(8)).toEqual({
			allowed: false,
			invoiceCount: 8,
		});
	});

	it("fails closed on a negative count rather than treating it as empty", () => {
		// Only reachable from a corrupt or mocked source, but a delete is
		// irreversible, so an impossible input must not read as "safe to delete".
		expect(evaluateCustomerDeletion(-1)).toEqual({
			allowed: false,
			invoiceCount: -1,
		});
	});
});
