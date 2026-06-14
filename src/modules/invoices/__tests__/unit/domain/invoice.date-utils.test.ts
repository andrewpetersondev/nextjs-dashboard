import { afterEach, describe, expect, it, vi } from "vitest";
import {
	formatInvoiceDateLocalized,
	getCurrentIsoDate,
} from "@/modules/invoices/domain/invoice.date-utils";

/**
 * Characterization tests for the invoice date helpers.
 *
 * The unit lane runs in UTC (see `vitest.config.ts`), so the values below are
 * deterministic regardless of the developer's machine timezone.
 */
describe("invoice.date-utils", () => {
	describe("getCurrentIsoDate", () => {
		afterEach(() => {
			vi.useRealTimers();
		});

		it("returns the current date as a YYYY-MM-DD string", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2025-08-12T15:30:00Z"));

			expect(getCurrentIsoDate()).toBe("2025-08-12");
		});

		it("uses the UTC calendar day, not local time", () => {
			vi.useFakeTimers();
			// Late-UTC instant: still the same UTC day.
			vi.setSystemTime(new Date("2025-12-31T23:59:59Z"));

			expect(getCurrentIsoDate()).toBe("2025-12-31");
		});

		it("always matches the YYYY-MM-DD shape", () => {
			expect(getCurrentIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});
	});

	describe("formatInvoiceDateLocalized", () => {
		it("formats a YYYY-MM-DD date in the default en-US locale", () => {
			expect(formatInvoiceDateLocalized("2025-08-12")).toBe("Aug 12, 2025");
		});

		it("honors a non-default locale", () => {
			expect(formatInvoiceDateLocalized("2025-08-12", "de-DE")).toBe(
				"12. Aug. 2025",
			);
		});

		it("formats single-digit days without zero padding (en-US)", () => {
			expect(formatInvoiceDateLocalized("2025-01-05")).toBe("Jan 5, 2025");
		});
	});
});
