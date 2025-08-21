import type { InvoiceListFilter } from "@/features/invoices/types";

/**
 * Dashboard card summary data.
 */
export type DashboardCardData = {
  totalInvoices: number; // Total number of invoices
  totalPaid: string; // Formatted currency
  totalPending: string; // Formatted currency
  totalCustomers: number;
};

export type DashboardData = {
  cards: DashboardCardData;
  latestInvoices: InvoiceListFilter[];
};
