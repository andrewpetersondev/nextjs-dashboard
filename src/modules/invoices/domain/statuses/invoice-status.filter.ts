import {
	INVOICE_DISPLAY_STATUSES,
	type InvoiceDisplayStatus,
} from "@/modules/invoices/domain/statuses/invoice-status.display";

// The invoices-list filter vocabulary. Display statuses partition the table
// ("pending" here means pending AND not yet due; "overdue" is the rest of the
// stored-pending rows), so the five buckets' counts add up to "all".
export const INVOICE_STATUS_FILTERS = [
	"all",
	...INVOICE_DISPLAY_STATUSES,
] as const;
export type InvoiceStatusFilter = (typeof INVOICE_STATUS_FILTERS)[number];

export const DEFAULT_INVOICE_STATUS_FILTER: InvoiceStatusFilter = "all";

/**
 * Parses an untrusted value (URL searchParam) into a filter.
 * Silent fallback to "all" — bad input is not an error on a shareable URL.
 */
export function parseInvoiceStatusFilter(value: unknown): InvoiceStatusFilter {
	if (
		typeof value === "string" &&
		(INVOICE_STATUS_FILTERS as readonly string[]).includes(value)
	) {
		return value as InvoiceStatusFilter;
	}
	return DEFAULT_INVOICE_STATUS_FILTER;
}

export function isInvoiceDisplayStatus(
	value: InvoiceStatusFilter,
): value is InvoiceDisplayStatus {
	return value !== "all";
}
