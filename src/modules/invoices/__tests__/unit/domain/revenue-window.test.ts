import { describe, expect, it } from "vitest";
import {
	enumerateRevenuePeriods,
	fillRevenuePeriodGaps,
	REVENUE_WINDOW_MONTHS,
	revenueWindowStart,
} from "@/modules/invoices/domain/revenue/revenue-window";

const AUG_2026 = new Date("2026-08-09T12:00:00Z");

describe("enumerateRevenuePeriods", () => {
	it("returns one period per month, oldest first, ending with the current month", () => {
		const periods = enumerateRevenuePeriods(AUG_2026);

		expect(periods).toHaveLength(REVENUE_WINDOW_MONTHS);
		expect(periods.at(-1)).toBe("2026-08-01");
		expect(periods[0]).toBe("2025-09-01");
	});

	it("rolls the year back correctly when the window crosses January", () => {
		// Date.UTC normalizes a negative month index, which is why no manual
		// year wrapping is needed — this pins that behaviour.
		const periods = enumerateRevenuePeriods(
			new Date("2026-02-15T00:00:00Z"),
			4,
		);

		expect(periods).toEqual([
			"2025-11-01",
			"2025-12-01",
			"2026-01-01",
			"2026-02-01",
		]);
	});

	it("always produces first-of-month keys, zero-padded", () => {
		const periods = enumerateRevenuePeriods(
			new Date("2026-03-31T23:59:59Z"),
			3,
		);

		expect(periods).toEqual(["2026-01-01", "2026-02-01", "2026-03-01"]);
	});

	it("does not slip a month when the date is the first at UTC midnight", () => {
		// The classic off-by-one: local-time getters on a UTC-midnight first of
		// the month report the previous month in any negative-offset zone.
		const periods = enumerateRevenuePeriods(
			new Date("2026-01-01T00:00:00Z"),
			2,
		);

		expect(periods).toEqual(["2025-12-01", "2026-01-01"]);
	});
});

describe("revenueWindowStart", () => {
	it("is the oldest period in the window", () => {
		expect(revenueWindowStart(AUG_2026)).toBe("2025-09-01");
		expect(revenueWindowStart(AUG_2026, 1)).toBe("2026-08-01");
	});
});

describe("fillRevenuePeriodGaps", () => {
	it("inserts zeroed months the query did not return", () => {
		// GROUP BY only returns months that have invoices; plotting that directly
		// would drop quiet months and shift every later bar left.
		const filled = fillRevenuePeriodGaps(
			[{ overdue: 0, paid: 500, pending: 0, period: "2026-08-01" }],
			AUG_2026,
			3,
		);

		expect(filled.map((r) => r.period)).toEqual([
			"2026-06-01",
			"2026-07-01",
			"2026-08-01",
		]);
		expect(filled[0]).toEqual({
			overdue: 0,
			paid: 0,
			pending: 0,
			period: "2026-06-01",
		});
	});

	it("preserves the values of months that are present", () => {
		const filled = fillRevenuePeriodGaps(
			[{ overdue: 7, paid: 500, pending: 3, period: "2026-07-01" }],
			AUG_2026,
			2,
		);

		expect(filled[0]).toEqual({
			overdue: 7,
			paid: 500,
			pending: 3,
			period: "2026-07-01",
		});
	});

	it("drops rows outside the window rather than appending them", () => {
		const filled = fillRevenuePeriodGaps(
			[{ overdue: 0, paid: 999, pending: 0, period: "2020-01-01" }],
			AUG_2026,
			2,
		);

		expect(filled).toHaveLength(2);
		expect(filled.some((r) => r.period === "2020-01-01")).toBe(false);
	});

	it("returns a full window even when the query returned nothing", () => {
		const filled = fillRevenuePeriodGaps([], AUG_2026);

		expect(filled).toHaveLength(REVENUE_WINDOW_MONTHS);
		expect(filled.every((r) => r.paid === 0)).toBe(true);
	});
});
