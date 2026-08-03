import { INVOICE_NET_DAYS } from "@/modules/invoices/domain/invoice.constants";
import type { InvoiceStatus } from "@/modules/invoices/domain/statuses/invoice.statuses";

const MS_PER_DAY = 86_400_000;

// Display statuses = stored statuses + the derived "overdue". "overdue" is
// never written to the database: a pending invoice past its due date is
// SHOWN as overdue, computed at read time from `date` + NET terms. Storing it
// would need a background job to flip it and would go stale the moment the
// clock moves; deriving keeps a single source of truth.
export const INVOICE_DISPLAY_STATUSES = [
	"pending",
	"overdue",
	"paid",
	"void",
] as const;
export type InvoiceDisplayStatus = (typeof INVOICE_DISPLAY_STATUSES)[number];

/**
 * Due date derived from the issue date (NET terms).
 * The seam that would make a later real `due_date` column non-breaking.
 */
export function dueDateOf(issueDate: Date): Date {
	return new Date(issueDate.getTime() + INVOICE_NET_DAYS * MS_PER_DAY);
}

/**
 * Issue-date cutoff for SQL filters: a pending invoice with
 * `date < cutoff` is overdue. Exact mirror of {@link dueDateOf} (same ms
 * arithmetic), so the SQL filter and the badge can never disagree.
 */
export function overdueIssueDateCutoff(now: Date): Date {
	return new Date(now.getTime() - INVOICE_NET_DAYS * MS_PER_DAY);
}

export function isInvoiceOverdue(
	status: InvoiceStatus,
	issueDate: Date,
	now: Date,
): boolean {
	return status === "pending" && dueDateOf(issueDate).getTime() < now.getTime();
}

export function deriveInvoiceDisplayStatus(
	status: InvoiceStatus,
	issueDate: Date,
	now: Date,
): InvoiceDisplayStatus {
	return isInvoiceOverdue(status, issueDate, now) ? "overdue" : status;
}
