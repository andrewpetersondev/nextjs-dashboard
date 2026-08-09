import { describe, expect, it } from "vitest";
import type { RevenuePeriodTotals } from "@/modules/invoices/domain/revenue/revenue.types";
import {
	buildRevenueChartModel,
	niceCeiling,
	periodToMonthLabel,
} from "@/modules/invoices/domain/revenue/revenue-chart.model";

function row(
	period: string,
	overrides: Partial<RevenuePeriodTotals> = {},
): RevenuePeriodTotals {
	return { overdue: 0, paid: 0, pending: 0, period, ...overrides };
}

describe("niceCeiling", () => {
	it("rounds up to the next 1/2/5/10 times a power of ten", () => {
		expect(niceCeiling(5_780_467)).toBe(10_000_000);
		expect(niceCeiling(1200)).toBe(2000);
		expect(niceCeiling(4100)).toBe(5000);
		expect(niceCeiling(51)).toBe(100);
	});

	it("leaves an already-nice value alone", () => {
		expect(niceCeiling(5000)).toBe(5000);
		expect(niceCeiling(100)).toBe(100);
	});

	it("returns 0 for zero and negatives rather than NaN or -Infinity", () => {
		// Math.log10(0) is -Infinity; without the guard the exponent poisons
		// every downstream coordinate.
		expect(niceCeiling(0)).toBe(0);
		expect(niceCeiling(-5)).toBe(0);
	});
});

describe("periodToMonthLabel", () => {
	it("reads the month from the period string", () => {
		expect(periodToMonthLabel("2026-08-01")).toBe("Aug");
		expect(periodToMonthLabel("2026-01-01")).toBe("Jan");
		expect(periodToMonthLabel("2026-12-01")).toBe("Dec");
	});

	it("does not shift the month across a timezone", () => {
		// `new Date("2026-01-01")` is UTC midnight, which formats as Dec 31 in any
		// negative-offset zone. Parsing the digits keeps January in January.
		expect(periodToMonthLabel("2026-01-01")).toBe("Jan");
	});

	it("degrades to the raw period rather than throwing on malformed input", () => {
		expect(periodToMonthLabel("nonsense")).toBe("nonsense");
		expect(periodToMonthLabel("2026-13-01")).toBe("2026-13-01");
	});
});

describe("buildRevenueChartModel", () => {
	it("stacks paid at the bottom and overdue on top", () => {
		const model = buildRevenueChartModel([
			row("2026-08-01", { overdue: 100, paid: 100, pending: 100 }),
		]);

		const [bar] = model.bars;
		const buckets = bar?.segments.map((segment) => segment.bucket);
		expect(buckets).toEqual(["paid", "pending", "overdue"]);

		// Larger y is further down the SVG, so the bottom segment has the largest y.
		const [paid, pending, overdue] = bar?.segments ?? [];
		expect(paid?.y).toBeGreaterThan(pending?.y ?? 0);
		expect(pending?.y).toBeGreaterThan(overdue?.y ?? 0);
	});

	it("keeps every coordinate finite when there is no revenue at all", () => {
		// The bug this guards: an all-zero dataset makes the axis maximum 0, and
		// dividing by it writes NaN into every y/height — the SVG then renders
		// nothing at all, with no error anywhere.
		const model = buildRevenueChartModel([
			row("2026-07-01"),
			row("2026-08-01"),
		]);

		expect(model.isEmpty).toBe(true);
		expect(model.axisMax).toBe(0);

		for (const bar of model.bars) {
			for (const segment of bar.segments) {
				expect(Number.isFinite(segment.y)).toBe(true);
				expect(Number.isFinite(segment.height)).toBe(true);
				expect(segment.height).toBe(0);
			}
		}
	});

	it("is not empty as soon as one bucket has value", () => {
		const model = buildRevenueChartModel([row("2026-08-01", { paid: 1 })]);
		expect(model.isEmpty).toBe(false);
	});

	it("scales the tallest bar to the axis maximum, not past it", () => {
		const model = buildRevenueChartModel([row("2026-08-01", { paid: 10_000 })]);
		const [bar] = model.bars;
		const total = (bar?.segments ?? []).reduce(
			(sum, segment) => sum + segment.height,
			0,
		);

		// 10_000 rounds to an axis max of 10_000, so the bar fills the plot exactly.
		expect(model.axisMax).toBe(10_000);
		expect(total).toBeCloseTo(model.plotHeight);
	});

	it("never draws above the plot area", () => {
		const model = buildRevenueChartModel([
			row("2026-07-01", { overdue: 3000, paid: 4100, pending: 2000 }),
			row("2026-08-01", { paid: 900 }),
		]);

		for (const bar of model.bars) {
			for (const segment of bar.segments) {
				expect(segment.y).toBeGreaterThanOrEqual(0);
				expect(segment.y + segment.height).toBeLessThanOrEqual(
					model.plotHeight + Number.EPSILON,
				);
			}
		}
	});

	it("spaces bars evenly and reports the total plot width", () => {
		const model = buildRevenueChartModel([
			row("2026-06-01", { paid: 1 }),
			row("2026-07-01", { paid: 1 }),
			row("2026-08-01", { paid: 1 }),
		]);

		const xs = model.bars.map((bar) => bar.x);
		expect(xs[0]).toBe(0);
		expect((xs[1] ?? 0) - (xs[0] ?? 0)).toBe((xs[2] ?? 0) - (xs[1] ?? 0));
		// Width spans the bars without a trailing gap.
		expect(model.plotWidth).toBe((xs[2] ?? 0) + (model.bars[2]?.width ?? 0));
	});

	it("handles an empty dataset without producing a negative width", () => {
		const model = buildRevenueChartModel([]);

		expect(model.bars).toHaveLength(0);
		expect(model.plotWidth).toBe(0);
		expect(model.isEmpty).toBe(true);
	});

	it("reports each bar's total so the caller need not re-add the buckets", () => {
		const model = buildRevenueChartModel([
			row("2026-08-01", { overdue: 30, paid: 10, pending: 20 }),
		]);

		expect(model.bars[0]?.total).toBe(60);
	});
});
