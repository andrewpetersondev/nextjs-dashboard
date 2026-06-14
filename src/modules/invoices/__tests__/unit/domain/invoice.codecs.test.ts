import { describe, expect, it } from "vitest";
import {
	encodeInvoiceDateToIso,
	encodePeriodToFirstDay,
} from "@/modules/invoices/domain/invoice.codecs";
import { toPeriod } from "@/shared/primitives/period/period.mappers";

/**
 * Characterization tests for the invoice transport codecs.
 *
 * The unit lane runs in UTC (see `vitest.config.ts`); `encodePeriodToFirstDay`
 * uses date-fns `format`, which reads the local timezone, so UTC keeps the
 * "first day of month" output stable.
 */
describe("invoice.codecs", () => {
	describe("encodeInvoiceDateToIso", () => {
		it("encodes a Date to a YYYY-MM-DD string (UTC calendar day)", () => {
			expect(encodeInvoiceDateToIso(new Date("2025-08-12T00:00:00Z"))).toBe(
				"2025-08-12",
			);
		});

		it("drops the time component", () => {
			expect(encodeInvoiceDateToIso(new Date("2025-08-12T23:59:59Z"))).toBe(
				"2025-08-12",
			);
		});
	});

	describe("encodePeriodToFirstDay", () => {
		it("encodes a Period to a YYYY-MM-01 first-of-month string", () => {
			const period = toPeriod("2025-08-01");

			expect(encodePeriodToFirstDay(period)).toBe("2025-08-01");
		});

		it("normalizes any day in the month to the first (via Period)", () => {
			// toPeriod accepts a Date and snaps it to the first of the month.
			const period = toPeriod(new Date("2025-08-23T00:00:00Z"));

			expect(encodePeriodToFirstDay(period)).toBe("2025-08-01");
		});
	});
});
