/**
 * Configuration constants for seeding operations.
 */
export const SEED_CONFIG = {
	/**
	 * How much the typical band drifts upward across the whole seeded window,
	 * as a multiplier on the newest month. Produces a visible trend without
	 * making the oldest months look empty.
	 */
	amountGrowthFactor: 1.8,

	// === Status mix by month age ============================================
	// "Overdue" is derived, not stored: a stored-pending invoice older than
	// NET-30 renders as overdue. So the age of the month decides what a pending
	// invoice will *look* like, and these shares are what give the chart a
	// visible pending band in recent months and overdue further back.
	/** Current month — past due is impossible, so these render as pending. */
	currentMonthPendingShare: 0.65,
	demoCounterMax: 100,
	demoCounterMin: 1,
	firstDayOfMonth: 1,
	generateMonthlyPeriodsCount: 19,
	invoicesInNewestMonth: 7,

	// === Volume ramp =========================================================
	// Invoices per month, interpolated from the oldest seeded month to the
	// current one. A flat count reads as synthetic; a gentle ramp reads as a
	// business that grew, which is the story the dashboard chart tells.
	invoicesInOldestMonth: 2,
	largeAmountThreshold: 1_500_001,
	/**
	 * Share of invoices drawn from the large tier instead of the typical band,
	 * at the newest month. Scaled down by the same ramp as the amounts, so a
	 * single large deal cannot swamp an early month that only has two or three
	 * invoices — which is what put a $47k spike near the start of the window and
	 * fought the growth trend the chart is meant to show.
	 */
	largeInvoiceShare: 0.12,
	maxAmountCents: 1_500_000,
	maxLargeAmountCents: 5_000_000,

	// === Amount tiers ========================================================
	// The tier bounds are pinned by `seed-amounts.schema-contract.test.ts`:
	// every value the seed can emit must round-trip the invoice schema.
	minAmountCents: 500,

	minMonth: 1,
	monthsInYear: 12,
	/** Older months — any pending here is necessarily overdue. */
	olderMonthPendingShare: 0.12,

	/**
	 * Fixed PRNG seed. Changing it reshuffles the entire demo dataset, so treat
	 * it as a value with consequences: screenshots, recorded walkthroughs and the
	 * numbers quoted in docs all move with it.
	 */
	randomSeed: 20_260_809,
	/** Previous month — straddles the NET-30 boundary by day of month. */
	recentMonthPendingShare: 0.4,
	saltRounds: 10,
	singleCentAmount: 1,
	typicalAmountMaxCents: 900_000,

	/** The band most invoices fall in — $250 to $9,000. */
	typicalAmountMinCents: 25_000,
	/** Voided share, applied at every age. */
	voidShare: 0.07,
} as const;
