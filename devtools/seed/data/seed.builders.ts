import type { InvoiceStatus } from "@database/schema/schema.constants";
import { SEED_CONFIG } from "@devtools/seed/data/seed.constants";
import type {
	NewInvoice,
	SeedCustomerIdRow,
	SeedUserRow,
} from "@devtools/seed/data/seed.types";
import { seedUserInputs } from "@devtools/seed/data/seed.users";
import {
	createSeededRandom,
	pickItem,
	randomIntBetween,
} from "@devtools/seed/seed.random";
import {
	buildInvoiceDateForPeriod,
	revenuePeriodForDate,
} from "@devtools/seed/seed-periods";
import { toCustomerId } from "@devtools/shared/id.mapper";
import { hashPassword } from "@devtools/users/hash-password";

const MS_PER_DAY = 86_400_000;
const CURRENT_MONTH_AGE = 0;
const RECENT_MONTH_AGE = 1;
/** Spread invoices across the month rather than clustering them on day 1. */
const DAY_SPREAD_START = 3;
const DAY_SPREAD_STEP = 4;

/**
 * Anchor invoices, positioned relative to `now` rather than drawn from the
 * random distribution.
 *
 * @remarks
 * These exist so the e2e suite's assumptions are guaranteed **by construction**
 * rather than by luck. `status-lifecycle.cy.ts` opens the first overdue invoice
 * to exercise both transitions, and asserts the paid bucket is non-empty; with
 * purely random statuses a run could legitimately produce zero overdue rows and
 * fail three tests with no code change to blame.
 *
 * The day offsets straddle NET-30 deliberately: 45 days is always past due,
 * 3 days never is.
 */
const ANCHOR_INVOICES = [
	{ daysAgo: 45, label: "guaranteed overdue", status: "pending" },
	{ daysAgo: 3, label: "guaranteed pending within terms", status: "pending" },
	{ daysAgo: 10, label: "guaranteed paid", status: "paid" },
	{ daysAgo: 20, label: "guaranteed void", status: "void" },
] as const satisfies readonly {
	daysAgo: number;
	label: string;
	status: InvoiceStatus;
}[];

function lerp(from: number, to: number, fraction: number): number {
	return from + (to - from) * fraction;
}

/**
 * Status for an invoice in a month of the given age.
 *
 * Age drives the mix because "overdue" is derived from the date, not stored: a
 * pending invoice in the current month shows as pending, and the identical row
 * a few months back shows as overdue.
 */
function statusForMonthAge(
	random: () => number,
	monthAge: number,
): InvoiceStatus {
	if (random() < SEED_CONFIG.voidShare) {
		return "void";
	}

	// Annotated: SEED_CONFIG is `as const`, so without this the binding narrows
	// to the literal type of the first share and rejects the others.
	let pendingShare: number = SEED_CONFIG.olderMonthPendingShare;
	if (monthAge === CURRENT_MONTH_AGE) {
		pendingShare = SEED_CONFIG.currentMonthPendingShare;
	} else if (monthAge === RECENT_MONTH_AGE) {
		pendingShare = SEED_CONFIG.recentMonthPendingShare;
	}

	return random() < pendingShare ? "pending" : "paid";
}

/**
 * Amount in cents for an invoice in a month at `growth` along the ramp.
 *
 * The edge-case tiers ($0, one cent) are deliberately absent here — they are
 * emitted once each as explicit rows so they still exist for the schema
 * contract without littering the demo. Previously ~20% of all invoices were
 * $0.00, $0.01 or $5.00, which is what put a "$5.00" line on the dashboard.
 */
function amountForMonth(
	random: () => number,
	growth: number,
	progress: number,
): number {
	// Large deals scale with `progress` (0 at the oldest month, 1 at the newest)
	// rather than with the amount ramp, which never drops below ~0.56. A young
	// business landing a $47k deal in a four-invoice month produced a spike near
	// the start of the window that fought the growth trend the chart exists to
	// show.
	if (random() < SEED_CONFIG.largeInvoiceShare * progress) {
		return randomIntBetween(
			random,
			SEED_CONFIG.largeAmountThreshold,
			SEED_CONFIG.maxLargeAmountCents,
		);
	}

	return Math.round(
		randomIntBetween(
			random,
			SEED_CONFIG.typicalAmountMinCents,
			SEED_CONFIG.typicalAmountMaxCents,
		) * growth,
	);
}

/** The invoices for one seeded month. */
function buildMonthRows(input: {
	readonly customers: readonly SeedCustomerIdRow[];
	/** 0 at the current month, increasing into the past. */
	readonly monthAge: number;
	readonly now: Date;
	readonly period: string;
	/** 0 at the oldest seeded month, 1 at the current one. */
	readonly progress: number;
	readonly random: () => number;
}): NewInvoice[] {
	const { customers, monthAge, now, period, progress, random } = input;

	const invoiceCount = Math.round(
		lerp(
			SEED_CONFIG.invoicesInOldestMonth,
			SEED_CONFIG.invoicesInNewestMonth,
			progress,
		),
	);
	const growth = lerp(1 / SEED_CONFIG.amountGrowthFactor, 1, progress);

	return Array.from({ length: invoiceCount }, (_, n): NewInvoice => {
		const { invoiceDate, revenuePeriod } = buildInvoiceDateForPeriod(
			period,
			DAY_SPREAD_START + n * DAY_SPREAD_STEP,
			now,
		);

		return {
			amount: amountForMonth(random, growth, progress),
			customerId: toCustomerId(pickItem(random, customers).id),
			date: invoiceDate,
			revenuePeriod,
			status: statusForMonthAge(random, monthAge),
		} as NewInvoice;
	});
}

/** One invoice per display bucket, so none of them can ever be empty. */
function buildAnchorRows(
	random: () => number,
	customers: readonly SeedCustomerIdRow[],
	now: Date,
): NewInvoice[] {
	return ANCHOR_INVOICES.map((anchor): NewInvoice => {
		const date = new Date(now.getTime() - anchor.daysAgo * MS_PER_DAY);

		return {
			amount: amountForMonth(random, 1, 1),
			customerId: toCustomerId(pickItem(random, customers).id),
			date,
			// Derived from the date, never chosen: the table's CHECK constraint
			// requires revenue_period = date_trunc('month', date).
			revenuePeriod: revenuePeriodForDate(date),
			status: anchor.status,
		} as NewInvoice;
	});
}

/**
 * The two edge-case amounts the schema contract covers.
 *
 * Kept to one row each in the oldest month, so they still exist in the data
 * without appearing anywhere the demo looks. Previously the $0.00 / $0.01 / $5
 * tiers were ~20% of all invoices, which is what put a "$5.00" line on the
 * dashboard's latest-invoices list.
 */
function buildEdgeCaseRows(
	random: () => number,
	customers: readonly SeedCustomerIdRow[],
	oldestPeriod: string,
	now: Date,
): NewInvoice[] {
	return [0, SEED_CONFIG.singleCentAmount].map((amount): NewInvoice => {
		const { invoiceDate, revenuePeriod } = buildInvoiceDateForPeriod(
			oldestPeriod,
			SEED_CONFIG.firstDayOfMonth,
			now,
		);

		return {
			amount,
			customerId: toCustomerId(pickItem(random, customers).id),
			date: invoiceDate,
			revenuePeriod,
			status: "paid",
		} as NewInvoice;
	});
}

/**
 * Build the demo invoice rows.
 *
 * Deterministic: the same customers, periods and `now` always produce the same
 * rows, so a reseed does not reshape the demo. See {@link createSeededRandom}.
 *
 * @param existingCustomers - Customers already inserted, to reference.
 * @param availablePeriods - `YYYY-MM-01` keys, **oldest first**.
 * @param now - Injected for tests; also decides which month counts as current.
 */
export function buildInvoiceRows(
	existingCustomers: readonly SeedCustomerIdRow[],
	availablePeriods: readonly string[],
	now: Date = new Date(),
): NewInvoice[] {
	if (existingCustomers.length === 0) {
		throw new Error("buildInvoiceRows requires at least one customer");
	}
	if (availablePeriods.length === 0) {
		throw new Error("buildInvoiceRows requires at least one period");
	}

	const random = createSeededRandom(SEED_CONFIG.randomSeed);
	const lastIndex = availablePeriods.length - 1;

	const monthlyRows = availablePeriods.flatMap((period, index) =>
		buildMonthRows({
			customers: existingCustomers,
			monthAge: lastIndex - index,
			now,
			period,
			progress: lastIndex === 0 ? 1 : index / lastIndex,
			random,
		}),
	);

	return [
		...monthlyRows,
		...buildAnchorRows(random, existingCustomers, now),
		...buildEdgeCaseRows(
			random,
			existingCustomers,
			availablePeriods[0] ?? "",
			now,
		),
	];
}

/**
 * Build demo users with hashed passwords.
 */
export function buildUserSeed(): Promise<readonly SeedUserRow[]> {
	return Promise.all(
		seedUserInputs.map(async ({ email, password, role, username }) => ({
			email,
			password: await hashPassword(password),
			role,
			username,
		})),
	);
}
