import type {
	CustomerAggregatesServerDto,
	FormattedCustomersTableRow,
} from "@/modules/customers/domain/types";
import { formatCurrency } from "@/shared/primitives/money/convert";

/**
 * Turns a customer aggregate into the row the customers table renders.
 *
 * @returns The row with `totalPaid`/`totalPending` converted from cents to
 * formatted currency strings, so they can no longer be summed or compared
 * numerically. `totalInvoices` stays a number — it is a count, not an amount.
 */
export const toFormattedCustomersTableRow = (
	row: CustomerAggregatesServerDto,
): FormattedCustomersTableRow => ({
	email: row.email,
	id: row.id,
	imageUrl: row.imageUrl,
	name: row.name,
	totalInvoices: row.totalInvoices,
	totalPaid: formatCurrency(row.totalPaid),
	totalPending: formatCurrency(row.totalPending),
});
