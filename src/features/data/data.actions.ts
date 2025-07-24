"use server";

import { getDB } from "@/db/connection";
import { fetchTotalCustomersCountDal } from "@/features/customers/customer.dal";
import type { DashboardData } from "@/features/data/data.types";
import {
  fetchLatestInvoicesDal,
  fetchTotalInvoicesCountDal,
  fetchTotalPaidInvoicesDal,
  fetchTotalPendingInvoicesDal,
} from "@/features/invoices/invoice.dal";
import { formatCurrency } from "@/lib/utils/utils";

/**
 * Server action to fetch all dashboard data including cards and latest invoices.
 */
export async function readDashboardDataAction(): Promise<DashboardData> {
  const db = getDB();

  const [
    invoicesCount,
    totalPending,
    totalPaid,
    totalCustomers,
    latestInvoices,
  ] = await Promise.all([
    fetchTotalInvoicesCountDal(db),
    fetchTotalPendingInvoicesDal(db),
    fetchTotalPaidInvoicesDal(db),
    fetchTotalCustomersCountDal(db),
    fetchLatestInvoicesDal(db),
  ]);

  return {
    cards: {
      totalCustomers,
      totalInvoices: invoicesCount,
      totalPaid: formatCurrency(totalPaid),
      totalPending: formatCurrency(totalPending),
    },
    latestInvoices,
  };
}
