import type { JSX } from "react";
import {
	REVENUE_BUCKETS,
	type RevenueBucket,
	type RevenuePeriodTotals,
} from "@/modules/invoices/domain/revenue/revenue.types";
import {
	buildRevenueChartModel,
	type RevenueChartModel,
} from "@/modules/invoices/domain/revenue/revenue-chart.model";
import {
	formatCompactCurrency,
	formatCurrency,
} from "@/shared/primitives/money/convert";
import { H2 } from "@/ui/atoms/headings.atom";

/**
 * SVG layout, in the viewBox's own user units.
 *
 * The chart scales with `w-full h-auto`, so these are proportions rather than
 * pixels — the viewBox does the responsive work and there are no breakpoints
 * to maintain.
 */
const CHART_TITLE = "Revenue by month, split by invoice status";

/** Divisor for centring a label under its bar. */
const HALF = 2;

const LAYOUT = {
	/** Left gutter reserved for the y-axis labels. */
	axisWidth: 52,
	/** Corner radius on each bar segment. */
	barRadius: 2,
	/** Gap below the plot for the month labels. */
	labelBand: 22,
	labelOffset: 15,
	/** Right padding so the final bar is not flush with the edge. */
	rightPad: 8,
	tickFontSize: 10,
	tickLabelOffset: 3,
	/** Headroom above the top gridline; its label's ascender sits above y=0. */
	topPad: 8,
} as const;

/** Fill class per bucket — the same hues as the status badges, so a reader
 * learns one color language across the page. The *text* tokens are used rather
 * than the badge background tokens because they are the contrast-tuned pair:
 * `bg-bg-secondary` on `bg-bg-primary` is nearly invisible in both schemes. */
const BUCKET_FILL: Record<RevenueBucket, string> = {
	overdue: "fill-text-error",
	paid: "fill-text-secondary",
	pending: "fill-text-accent",
};

/** Legend swatch class per bucket, mirroring {@link BUCKET_FILL}. */
const BUCKET_SWATCH: Record<RevenueBucket, string> = {
	overdue: "bg-text-error",
	paid: "bg-text-secondary",
	pending: "bg-text-accent",
};

const BUCKET_LABEL: Record<RevenueBucket, string> = {
	overdue: "Overdue",
	paid: "Paid",
	pending: "Pending",
};

function ChartLegend(): JSX.Element {
	return (
		<ul className="flex flex-wrap gap-4 text-sm text-text-secondary">
			{REVENUE_BUCKETS.map((bucket) => (
				<li className="flex items-center gap-2" key={bucket}>
					<span
						aria-hidden="true"
						className={`inline-block h-3 w-3 rounded-xs ${BUCKET_SWATCH[bucket]}`}
					/>
					{BUCKET_LABEL[bucket]}
				</li>
			))}
		</ul>
	);
}

/**
 * The screen-reader representation of the chart.
 *
 * @remarks
 * This is the accessible chart, not a courtesy extra. The `<svg>` is marked
 * `aria-hidden`, so this table is the *only* way the data reaches assistive
 * technology — which is also why it carries full `formatCurrency` precision
 * while the axis shows the compact form.
 */
function RevenueDataTable({
	rows,
}: {
	rows: readonly RevenuePeriodTotals[];
}): JSX.Element {
	return (
		<table className="sr-only">
			<caption>{CHART_TITLE}</caption>
			<thead>
				<tr>
					<th scope="col">Month</th>
					{REVENUE_BUCKETS.map((bucket) => (
						<th key={bucket} scope="col">
							{BUCKET_LABEL[bucket]}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map((row) => (
					<tr key={row.period}>
						<th scope="row">{row.period}</th>
						{REVENUE_BUCKETS.map((bucket) => (
							<td key={bucket}>{formatCurrency(row[bucket])}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

/** Gridlines and their y-axis labels. */
function ChartGrid({
	ticks,
	viewWidth,
}: {
	ticks: RevenueChartModel["ticks"];
	viewWidth: number;
}): JSX.Element[] {
	return ticks.map((tick) => (
		<g key={tick.value}>
			<line
				className="stroke-bg-secondary"
				x1={LAYOUT.axisWidth}
				x2={viewWidth}
				y1={tick.y}
				y2={tick.y}
			/>
			<text
				className="fill-text-secondary"
				fontSize={LAYOUT.tickFontSize}
				textAnchor="end"
				x={LAYOUT.axisWidth - LAYOUT.tickLabelOffset}
				y={tick.y + LAYOUT.tickLabelOffset}
			>
				{formatCompactCurrency(tick.value)}
			</text>
		</g>
	));
}

/** One stacked column per month, plus its label. */
function ChartBars({
	bars,
	plotHeight,
}: {
	bars: RevenueChartModel["bars"];
	plotHeight: number;
}): JSX.Element[] {
	return bars.map((bar) => (
		<g key={bar.period}>
			{bar.segments
				// A zero-value bucket would emit a zero-height rect: invisible, but
				// still a node in the tree for every empty month.
				.filter((segment) => segment.height > 0)
				.map((segment) => (
					<rect
						className={BUCKET_FILL[segment.bucket]}
						height={segment.height}
						key={segment.bucket}
						rx={LAYOUT.barRadius}
						width={bar.width}
						x={LAYOUT.axisWidth + bar.x}
						y={segment.y}
					/>
				))}
			<text
				className="fill-text-secondary"
				fontSize={LAYOUT.tickFontSize}
				textAnchor="middle"
				x={LAYOUT.axisWidth + bar.x + bar.width / HALF}
				y={plotHeight + LAYOUT.labelOffset}
			>
				{bar.label}
			</text>
		</g>
	));
}

/**
 * Monthly revenue as a stacked bar chart, split by invoice display status.
 *
 * @remarks
 * Hand-rolled inline SVG rather than a charting library, for three reasons that
 * all bite in this repo specifically:
 *
 * 1. **CSP.** Production runs `style-src 'self'`; the popular React chart
 *    libraries position elements with inline styles, which are stripped there.
 *    SVG geometry (`x`, `y`, `width`, `height`, `fill`) is expressed as
 *    `attributes`, which CSP does not govern — so this renders identically in
 *    dev and production.
 * 2. **Weight.** A chart library costs 50–100 KB gzipped for one chart, against
 *    a Lighthouse performance score currently at 100.
 * 3. **No client JS.** This is a server component; nothing hydrates.
 *
 * The region is named with `aria-label` rather than `aria-labelledby`: a server
 * component has no `useId`, and a hardcoded id would collide the moment a second
 * chart appeared on a page.
 */
export function RevenueChart({
	rows,
}: {
	rows: readonly RevenuePeriodTotals[];
}): JSX.Element {
	const model = buildRevenueChartModel(rows);

	const viewWidth = LAYOUT.axisWidth + model.plotWidth + LAYOUT.rightPad;
	const viewHeight = model.plotHeight + LAYOUT.labelBand;

	return (
		<section
			aria-label={CHART_TITLE}
			className="flex w-full flex-col"
			data-cy="revenue-chart"
		>
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<H2>Revenue by month</H2>
				<ChartLegend />
			</div>
			{/* Panel then inner surface, matching LatestInvoices: the bars need to
			    sit on bg-primary, both because that is the established look and
			    because the pending bars share a hue with the accent token. */}
			<div className="flex grow flex-col rounded-xl bg-bg-secondary p-4">
				<div className="rounded-md bg-bg-primary p-4">
					{model.isEmpty ? (
						<p className="py-8 text-center text-sm text-text-secondary">
							No invoices in the last 12 months yet.
						</p>
					) : (
						<svg
							aria-hidden="true"
							className="h-auto w-full"
							viewBox={`0 ${-LAYOUT.topPad} ${viewWidth} ${viewHeight + LAYOUT.topPad}`}
						>
							<title>{CHART_TITLE}</title>
							<ChartGrid ticks={model.ticks} viewWidth={viewWidth} />
							<ChartBars bars={model.bars} plotHeight={model.plotHeight} />
						</svg>
					)}
				</div>
			</div>

			<RevenueDataTable rows={rows} />
		</section>
	);
}
