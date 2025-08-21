"use server";

import type { DashboardData } from "@/features/data/types";
import { fetchTotalCustomersCountDal } from "@/server/dals/customer";
import {
  fetchLatestInvoicesDal,
  fetchTotalInvoicesCountDal,
  fetchTotalPaidInvoicesDal,
  fetchTotalPendingInvoicesDal,
} from "@/server/dals/invoice";
import { getDB } from "@/server/db/connection";
import { formatCurrency } from "@/shared/utils/general";

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
