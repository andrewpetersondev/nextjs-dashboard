import { SEED_CONFIG } from "@devtools/seed/data/seed.constants";
import { describe, expect, it } from "vitest";
import { UpdateInvoiceSchema } from "@/modules/invoices/domain/schema/invoice.schema";
import { CENTS_IN_DOLLAR } from "@/shared/primitives/money/money.constants";

/**
 * Seed ↔ schema contract: every amount the seed can generate must pass the
 * invoice schema, or seeded rows can never save a legitimate field edit
 * (the edit form round-trips the stored amount through the schema). This
 * mismatch shipped once — seeds up to $50k against a $10k schema cap,
 * found 2026-08-03 — and this test keeps either side from drifting again.
 */
describe("seed amounts fit the invoice schema", () => {
	// Every distinct amount tier generateInvoiceAmount() can produce, in
	// cents. The zero tier is a literal 0 in seed.builders.ts, not a config
	// value.
	const seedAmountTiersCents = [
		["zero tier", 0],
		["single cent", SEED_CONFIG.singleCentAmount],
		["regular minimum", SEED_CONFIG.minAmountCents],
		["regular maximum", SEED_CONFIG.maxAmountCents],
		["large threshold", SEED_CONFIG.largeAmountThreshold],
		["large maximum", SEED_CONFIG.maxLargeAmountCents],
	] as const;

	it.each(seedAmountTiersCents)(
		"%s round-trips the update schema",
		(_label, cents) => {
			const dollars = (cents / CENTS_IN_DOLLAR).toString();

			const result = UpdateInvoiceSchema.safeParse({ amount: dollars });

			expect(result.success).toBe(true);
		},
	);
});
