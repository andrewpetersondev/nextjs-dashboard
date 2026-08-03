import { describe, expect, it } from "vitest";
import {
	deriveInvoiceDisplayStatus,
	dueDateOf,
	isInvoiceOverdue,
	overdueIssueDateCutoff,
} from "@/modules/invoices/domain/statuses/invoice-status.display";

const NOW = new Date("2026-08-03T12:00:00.000Z");

describe("dueDateOf", () => {
	it("derives the due date as issue date + NET-30", () => {
		expect(dueDateOf(new Date("2026-01-01T00:00:00.000Z")).toISOString()).toBe(
			"2026-01-31T00:00:00.000Z",
		);
	});
});

describe("isInvoiceOverdue", () => {
	it("is true for a pending invoice past its due date", () => {
		expect(isInvoiceOverdue("pending", new Date("2026-06-01"), NOW)).toBe(true);
	});

	it("is false for a pending invoice not yet due", () => {
		expect(isInvoiceOverdue("pending", new Date("2026-07-20"), NOW)).toBe(
			false,
		);
	});

	it("is false exactly AT the due moment (strictly past-due only)", () => {
		const issue = new Date(NOW.getTime());
		const dueNow = new Date(dueDateOf(issue).getTime());
		// Shift "now" to the exact due instant: not overdue yet.
		expect(isInvoiceOverdue("pending", issue, dueNow)).toBe(false);
	});

	it.each(["paid", "void"] as const)(
		"is false for %s regardless of age",
		(status) => {
			expect(isInvoiceOverdue(status, new Date("2020-01-01"), NOW)).toBe(false);
		},
	);
});

describe("deriveInvoiceDisplayStatus", () => {
	it("maps old pending to overdue", () => {
		expect(
			deriveInvoiceDisplayStatus("pending", new Date("2026-06-01"), NOW),
		).toBe("overdue");
	});

	it("keeps recent pending as pending", () => {
		expect(
			deriveInvoiceDisplayStatus("pending", new Date("2026-07-20"), NOW),
		).toBe("pending");
	});

	it.each(["paid", "void"] as const)("passes %s through", (status) => {
		expect(
			deriveInvoiceDisplayStatus(status, new Date("2020-01-01"), NOW),
		).toBe(status);
	});
});

describe("overdueIssueDateCutoff", () => {
	it("mirrors dueDateOf exactly: overdue ⇔ issue date before the cutoff", () => {
		const cutoff = overdueIssueDateCutoff(NOW);
		const justOverdue = new Date(cutoff.getTime() - 1);
		const justNotOverdue = new Date(cutoff.getTime());

		expect(isInvoiceOverdue("pending", justOverdue, NOW)).toBe(true);
		expect(isInvoiceOverdue("pending", justNotOverdue, NOW)).toBe(false);
	});
});
