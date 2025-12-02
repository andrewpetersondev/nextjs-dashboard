"use server";

import type { InvoiceListFilter } from "@/features/invoices/domain/types";
import type { AppDatabase } from "@/server/db/db.connection";
import { fetchLatestInvoicesDal } from "@/server/invoices/infrastructure/dal/fetch-latest";
import { fetchTotalInvoicesCountDal } from "@/server/invoices/infrastructure/dal/fetch-total-count";
import { fetchTotalPaidInvoicesDal } from "@/server/invoices/infrastructure/dal/fetch-total-paid";
import { fetchTotalPendingInvoicesDal } from "@/server/invoices/infrastructure/dal/fetch-total-pending";

export type InvoicesSummary = {
  totalInvoices: number;
  totalPaid: number;
  totalPending: number;
};

export async function readInvoicesSummary(
  db: AppDatabase,
): Promise<InvoicesSummary> {
  const [totalInvoices, totalPending, totalPaid] = await Promise.all([
    fetchTotalInvoicesCountDal(db),
    fetchTotalPendingInvoicesDal(db),
    fetchTotalPaidInvoicesDal(db),
  ]);

  return { totalInvoices, totalPaid, totalPending };
}

export async function readLatestInvoices(
  db: AppDatabase,
  limit = 5,
): Promise<InvoiceListFilter[]> {
  return await fetchLatestInvoicesDal(db, limit);
}
