import type { CustomerId, InvoiceId } from "@/lib/definitions/brands";

/**
 * Data structure for dashboard cards.
 */
export interface _CardData {
  customerCount: number;
  invoiceCount: number;
  paidInvoices: number;
  pendingInvoices: number;
}

/**
 * Dashboard card summary data.
 */
export type DashboardCardData = {
  totalPaid: string; // Formatted currency
  totalPending: string; // Formatted currency
  totalCustomers: number;
};

/**
 * Raw DB row for latest invoices.
 */
export type _LatestInvoiceDbRow = {
  amount: number;
  customerId: CustomerId;
  customerName: string;
  date: string;
  id: InvoiceId;
  status: string;
};

/**
 * Latest invoice for dashboard UI.
 */
export type _LatestInvoice = {
  amount: string; // Formatted currency
  customerId: CustomerId;
  customerName: string;
  date: string;
  id: InvoiceId;
  status: string;
};

/**
 * Revenue data point for charting.
 */
export type RevenueData = {
  formattedRevenue: string;
  month: string; // YYYY-MM
  revenue: number;
};
