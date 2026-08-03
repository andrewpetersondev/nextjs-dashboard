import { describe, expect, it } from "vitest";
import { UpdateInvoiceSchema } from "@/modules/invoices/domain/schema/invoice.schema";

/**
 * Amount boundary tests for the invoice schema's dollars codec.
 *
 * The edit form round-trips stored amounts (cents / 100) through this
 * schema, so its accepted range must cover every amount the app's own data
 * can hold — $0 rows and large rows included (the 2026-08-03 cap/seed
 * mismatch made seeded rows above the old $10k cap uneditable).
 */
describe("invoice.schema amount codec", () => {
	it("decodes a decimal dollars string", () => {
		const result = UpdateInvoiceSchema.safeParse({ amount: "123.45" });

		expect(result.success).toBe(true);
		expect(result.data?.amount).toBe(123.45);
	});

	it("accepts zero (seeded $0 rows must stay editable)", () => {
		const result = UpdateInvoiceSchema.safeParse({ amount: "0" });

		expect(result.success).toBe(true);
		expect(result.data?.amount).toBe(0);
	});

	it("accepts the $100,000 cap exactly", () => {
		const result = UpdateInvoiceSchema.safeParse({ amount: "100000" });

		expect(result.success).toBe(true);
		expect(result.data?.amount).toBe(100_000);
	});

	it("rejects amounts above the cap with a readable message", () => {
		const result = UpdateInvoiceSchema.safeParse({ amount: "100000.01" });

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			"Amount cannot exceed $100,000.",
		);
	});

	it("rejects negative amounts with a readable message", () => {
		const result = UpdateInvoiceSchema.safeParse({ amount: "-5" });

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe("Amount cannot be negative.");
	});
});
