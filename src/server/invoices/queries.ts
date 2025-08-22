"use server";

import type { Database } from "@/server/db/connection";
import {
  fetchLatestInvoicesDal,
  fetchTotalInvoicesCountDal,
  fetchTotalPaidInvoicesDal,
  fetchTotalPendingInvoicesDal,
} from "@/server/invoices/dal";
import type { InvoiceListFilter } from "@/server/invoices/types";

export type InvoicesSummary = {
  totalInvoices: number;
  totalPaid: number;
  totalPending: number;
};

export async function readInvoicesSummary(
  db: Database,
): Promise<InvoicesSummary> {
  const [totalInvoices, totalPending, totalPaid] = await Promise.all([
    fetchTotalInvoicesCountDal(db),
    fetchTotalPendingInvoicesDal(db),
    fetchTotalPaidInvoicesDal(db),
  ]);

  return { totalInvoices, totalPaid, totalPending };
}

export async function readLatestInvoices(
  db: Database,
  limit = 5,
): Promise<InvoiceListFilter[]> {
  return fetchLatestInvoicesDal(db, limit);
}
