import {
	REVENUE_BUCKETS,
	type RevenueBucket,
	type RevenuePeriodTotals,
} from "@/modules/invoices/domain/revenue/revenue.types";

/**
 * Short month names indexed by calendar month (1–12).
 *
 * The period is parsed as a **string**, never through `new Date(period)`: this
 * repo has already been bitten by mixing UTC and local time in date handling,
 * and `new Date("2026-08-01")` parses as UTC midnight, which a runner in a
 * negative-offset zone formats as *July* 31. Reading the month digits directly
 * removes the timezone from the question entirely.
 */
const MONTH_LABELS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
] as const;

const MONTH_INDEX_OFFSET = 1;
const PERIOD_MONTH_PART = 1;
/**
 * Mantissas an axis maximum may round up to. These four numbers *are* the
 * definition of a "nice" axis top, so the constant's name and this comment are
 * the explanation the rule normally asks a named constant to provide.
 */
// biome-ignore lint/style/noMagicNumbers: the literals are the algorithm's definition, named here
const NICE_STEPS = [1, 2, 5, 10] as const;
const DECIMAL_BASE = 10;

/** Plot geometry, in the SVG's own user units. */
const DEFAULT_GEOMETRY = {
	/** Horizontal gap between adjacent bars. */
	barGap: 10,
	/** Width of one bar. */
	barWidth: 34,
	/** Height of the plotting area (excludes axis labels). */
	plotHeight: 160,
	/** Number of horizontal gridlines, including zero. */
	tickCount: 3,
} as const;

function sumBuckets(row: RevenuePeriodTotals): number {
	return REVENUE_BUCKETS.reduce((total, bucket) => total + row[bucket], 0);
}

type RevenueChartSegment = {
	readonly bucket: RevenueBucket;
	/** Distance from the top of the plot area (SVG y grows downward). */
	readonly y: number;
	readonly height: number;
	readonly value: number;
};

type RevenueChartBar = {
	readonly period: string;
	readonly label: string;
	readonly x: number;
	readonly width: number;
	readonly total: number;
	readonly segments: readonly RevenueChartSegment[];
};

/** One horizontal gridline. Referenced only through `RevenueChartModel`. */
type RevenueChartTick = {
	readonly value: number;
	readonly y: number;
};

export type RevenueChartGeometry = typeof DEFAULT_GEOMETRY;

export type RevenueChartModel = {
	readonly bars: readonly RevenueChartBar[];
	readonly ticks: readonly RevenueChartTick[];
	/** Axis maximum in cents — a rounded-up "nice" number, never the raw max. */
	readonly axisMax: number;
	readonly plotWidth: number;
	readonly plotHeight: number;
	/** True when every bucket in every period is zero. */
	readonly isEmpty: boolean;
};

/**
 * Rounds up to the next 1, 2, 5 or 10 × a power of ten.
 *
 * Gives the axis a readable top ("$60,000") instead of the raw maximum
 * ("$57,804.67"), and makes the gridline labels land on round numbers.
 */
export function niceCeiling(value: number): number {
	if (value <= 0) {
		return 0;
	}

	const magnitude = DECIMAL_BASE ** Math.floor(Math.log10(value));
	const normalized = value / magnitude;
	const step = NICE_STEPS.find((candidate) => normalized <= candidate);

	return (step ?? DECIMAL_BASE) * magnitude;
}

/**
 * "2026-08-01" → "Aug". Returns the raw period if it cannot be read, so a
 * malformed row degrades to an odd label rather than throwing inside a render.
 */
export function periodToMonthLabel(period: string): string {
	const month = Number.parseInt(
		period.split("-")[PERIOD_MONTH_PART] ?? "",
		DECIMAL_BASE,
	);

	return MONTH_LABELS[month - MONTH_INDEX_OFFSET] ?? period;
}

/**
 * Turns monthly totals into everything the SVG needs: bar rectangles, stacked
 * segments, and axis ticks.
 *
 * Pure and geometry-only, extracted for the same reason as `classifyFreshness`:
 * the interesting decisions here — the zero-data guard, the rounding of the
 * axis, the stacking order — are pinned by unit tests instead of being buried
 * in JSX where only a screenshot could check them.
 *
 * @remarks
 * The zero case is the one that matters. With no revenue at all, a naive
 * implementation divides by a zero maximum and emits `NaN` into every `y` and
 * `height` attribute; the SVG then renders nothing, silently. Here `axisMax`
 * stays 0, every segment is explicitly zero-height, and `isEmpty` lets the
 * component show an honest empty state instead.
 */
export function buildRevenueChartModel(
	rows: readonly RevenuePeriodTotals[],
	geometry: RevenueChartGeometry = DEFAULT_GEOMETRY,
): RevenueChartModel {
	const { barGap, barWidth, plotHeight, tickCount } = geometry;

	const rawMax = rows.reduce((max, row) => Math.max(max, sumBuckets(row)), 0);
	const axisMax = niceCeiling(rawMax);
	const isEmpty = axisMax === 0;

	// Guard every later division. When there is no revenue, scale by 1 so the
	// arithmetic stays finite and every computed height is exactly 0.
	const scaleDenominator = isEmpty ? 1 : axisMax;

	const bars = rows.map((row, index): RevenueChartBar => {
		let cumulative = 0;

		const segments = REVENUE_BUCKETS.map((bucket): RevenueChartSegment => {
			const value = row[bucket];
			const height = (value / scaleDenominator) * plotHeight;
			// Stack upward from the baseline; SVG y grows downward, so the
			// segment's top is the plot height minus everything below it.
			const y =
				plotHeight - (cumulative / scaleDenominator) * plotHeight - height;
			cumulative += value;

			return { bucket, height, value, y };
		});

		return {
			label: periodToMonthLabel(row.period),
			period: row.period,
			segments,
			total: cumulative,
			width: barWidth,
			x: index * (barWidth + barGap),
		};
	});

	const ticks = Array.from(
		{ length: tickCount },
		(_, index): RevenueChartTick => {
			const fraction = index / (tickCount - 1);
			return {
				value: axisMax * fraction,
				y: plotHeight - fraction * plotHeight,
			};
		},
	);

	const plotWidth =
		rows.length === 0 ? 0 : rows.length * (barWidth + barGap) - barGap;

	return { axisMax, bars, isEmpty, plotHeight, plotWidth, ticks };
}
