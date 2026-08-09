/**
 * The four summary figures on the dashboard overview cards.
 *
 * Monetary fields arrive already formatted, so they are display-only — summing
 * or comparing them numerically is a bug. The counts stay numbers.
 */
export type DashboardCardData = {
	totalInvoices: number;
	totalPaid: string; // formatted currency
	totalPending: string; // formatted currency
	totalCustomers: number;
};
