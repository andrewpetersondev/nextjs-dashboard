import "server-only";
import { customers } from "@database/schema/customers";
import { invoices } from "@database/schema/invoices";
import { and, eq, gte, ilike, lt, or, type SQL, sql } from "drizzle-orm";
import type { InvoiceStatusFilter } from "@/modules/invoices/domain/statuses/invoice-status.filter";

/**
 * Free-text search block shared by the invoices list. Note it also ilikes the
 * stored status text, so query="paid" + filter="pending" is an intentional
 * empty intersection (AND semantics) — coherent, not a bug. "overdue" is never
 * stored, so free text can only find it via the structured filter below.
 */
function searchCondition(query: string): SQL | undefined {
	return or(
		ilike(customers.name, `%${query}%`),
		ilike(customers.email, `%${query}%`),
		ilike(sql<string>`${invoices.amount}::text`, `%${query}%`),
		ilike(sql<string>`${invoices.date}::text`, `%${query}%`),
		ilike(sql<string>`${invoices.status}::text`, `%${query}%`),
	);
}

/**
 * Structured status conjunct. The display buckets partition stored-pending:
 * "pending" = pending AND not yet past due, "overdue" = pending AND past due —
 * so per-bucket counts add up to "all".
 */
function statusCondition(
	statusFilter: InvoiceStatusFilter,
	overdueIssueCutoff: Date,
): SQL | undefined {
	switch (statusFilter) {
		case "all":
			return;
		case "overdue":
			return and(
				eq(invoices.status, "pending"),
				lt(invoices.date, overdueIssueCutoff),
			);
		case "pending":
			return and(
				eq(invoices.status, "pending"),
				gte(invoices.date, overdueIssueCutoff),
			);
		case "paid":
		case "void":
			return eq(invoices.status, statusFilter);
		default: {
			const exhaustive: never = statusFilter;
			return exhaustive;
		}
	}
}

/**
 * The full invoices-list query input, bundled so both list DALs stay under
 * the parameter budget and can never drift apart on signature.
 */
export type InvoiceListWhereInput = Readonly<{
	/** Issue-date cutoff for the derived overdue bucket — computed IN TS from
	 * the domain's NET-terms constant and bound as a parameter; SQL never
	 * re-encodes the overdue rule. */
	overdueIssueCutoff: Date;
	query: string;
	statusFilter: InvoiceStatusFilter;
}>;

/**
 * The ONE where-builder for both invoices-list DALs (rows and page count).
 * They previously duplicated the where block verbatim; a filter added to only
 * one of them silently desyncs pagination from the rows — never inline this.
 */
export function buildInvoiceListWhere(
	input: InvoiceListWhereInput,
): SQL | undefined {
	return and(
		searchCondition(input.query),
		statusCondition(input.statusFilter, input.overdueIssueCutoff),
	);
}
