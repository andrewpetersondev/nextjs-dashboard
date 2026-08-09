import { buildInvoiceRows } from "@devtools/seed/data/seed.builders";
import { SEED_CONFIG } from "@devtools/seed/data/seed.constants";
import type { SeedCustomerIdRow } from "@devtools/seed/data/seed.types";
import { generateMonthlyPeriodsEndingNow } from "@devtools/seed/seed-periods";
import { describe, expect, it } from "vitest";
import { INVOICE_NET_DAYS } from "@/modules/invoices/domain/invoice.constants";

const MS_PER_DAY = 86_400_000;
const NOW = new Date("2026-08-09T12:00:00Z");

const CUSTOMERS: readonly SeedCustomerIdRow[] = [
	{ id: "11111111-1111-4111-8111-111111111111" },
	{ id: "22222222-2222-4222-8222-222222222222" },
	{ id: "33333333-3333-4333-8333-333333333333" },
];

function build(now: Date = NOW) {
	const periods = generateMonthlyPeriodsEndingNow(
		SEED_CONFIG.generateMonthlyPeriodsCount,
		now,
	);
	return buildInvoiceRows(CUSTOMERS, periods, now);
}

// `status` is optional on NewInvoice (the column has a default), so the guard
// accepts that shape rather than a narrowed one.
function isOverdue(
	row: { readonly date: Date; readonly status?: string },
	now: Date,
): boolean {
	return (
		row.status === "pending" &&
		row.date.getTime() + INVOICE_NET_DAYS * MS_PER_DAY < now.getTime()
	);
}

describe("generateMonthlyPeriodsEndingNow", () => {
	it("ends with the month containing now", () => {
		const periods = generateMonthlyPeriodsEndingNow(19, NOW);

		// The bug this replaces: a hardcoded start date meant the newest seeded
		// month drifted into the past, leaving the current month empty.
		expect(periods.at(-1)).toBe("2026-08-01");
		expect(periods).toHaveLength(19);
	});

	it("spans the requested number of months, oldest first", () => {
		const periods = generateMonthlyPeriodsEndingNow(3, NOW);

		expect(periods).toEqual(["2026-06-01", "2026-07-01", "2026-08-01"]);
	});
});

describe("buildInvoiceRows", () => {
	it("is deterministic — two builds produce identical rows", () => {
		// The whole point of the seeded PRNG: a reseed must not reshape the demo,
		// and the e2e suite must not depend on a lucky draw.
		expect(build()).toEqual(build());
	});

	it("always produces at least one invoice in every display bucket", () => {
		const rows = build();

		const overdue = rows.filter((r) => isOverdue(r, NOW));
		const pending = rows.filter(
			(r) => r.status === "pending" && !isOverdue(r, NOW),
		);

		// status-lifecycle.cy.ts opens the first overdue invoice to exercise both
		// transitions and asserts the paid bucket is non-empty. These are the
		// guarantees that spec silently relies on.
		expect(overdue.length).toBeGreaterThan(0);
		expect(pending.length).toBeGreaterThan(0);
		expect(rows.filter((r) => r.status === "paid").length).toBeGreaterThan(0);
		expect(rows.filter((r) => r.status === "void").length).toBeGreaterThan(0);
	});

	it("never dates an invoice in the future", () => {
		const rows = build();

		for (const row of rows) {
			expect(row.date.getTime()).toBeLessThanOrEqual(NOW.getTime());
		}
	});

	it("keeps revenuePeriod as the first of the invoice date's month", () => {
		// The invoices table has a CHECK constraint enforcing
		// revenue_period = date_trunc('month', date). Breaking it fails the whole
		// seed transaction at insert time, so it is cheaper to catch here.
		for (const row of build()) {
			const period = row.revenuePeriod as unknown as Date;

			expect(period.getUTCFullYear()).toBe(row.date.getUTCFullYear());
			expect(period.getUTCMonth()).toBe(row.date.getUTCMonth());
			expect(period.getUTCDate()).toBe(1);
		}
	});

	it("emits every amount within the tiers the schema contract covers", () => {
		for (const row of build()) {
			expect(row.amount).toBeGreaterThanOrEqual(0);
			expect(row.amount).toBeLessThanOrEqual(SEED_CONFIG.maxLargeAmountCents);
			expect(Number.isInteger(row.amount)).toBe(true);
		}
	});

	it("keeps the $0 and $0.01 edge cases to one row each", () => {
		const rows = build();

		// They exist for the schema contract, but ~20% of the demo used to be
		// these tiers — which is what put a "$5.00" line on the dashboard.
		expect(rows.filter((r) => r.amount === 0)).toHaveLength(1);
		expect(
			rows.filter((r) => r.amount === SEED_CONFIG.singleCentAmount),
		).toHaveLength(1);
	});

	it("issues more invoices in recent months than in the oldest ones", () => {
		const rows = build();
		const oldest = generateMonthlyPeriodsEndingNow(
			SEED_CONFIG.generateMonthlyPeriodsCount,
			NOW,
		)[0];

		const inOldest = rows.filter(
			(r) =>
				(r.revenuePeriod as unknown as Date).toISOString().slice(0, 10) ===
				oldest,
		);
		const inCurrent = rows.filter(
			(r) =>
				(r.revenuePeriod as unknown as Date).getUTCMonth() ===
					NOW.getUTCMonth() &&
				(r.revenuePeriod as unknown as Date).getUTCFullYear() ===
					NOW.getUTCFullYear(),
		);

		expect(inCurrent.length).toBeGreaterThan(inOldest.length);
	});

	it("rejects empty customers or periods rather than seeding nothing", () => {
		expect(() => buildInvoiceRows([], ["2026-08-01"], NOW)).toThrow();
		expect(() => buildInvoiceRows(CUSTOMERS, [], NOW)).toThrow();
	});
});
