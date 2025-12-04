"use server";

import type { InvoiceListFilter } from "@/modules/invoices/domain/types";
import { fetchLatestInvoicesDal } from "@/modules/invoices/server/infrastructure/repository/dal/fetch-latest";
import { fetchTotalInvoicesCountDal } from "@/modules/invoices/server/infrastructure/repository/dal/fetch-total-count";
import { fetchTotalPaidInvoicesDal } from "@/modules/invoices/server/infrastructure/repository/dal/fetch-total-paid";
import { fetchTotalPendingInvoicesDal } from "@/modules/invoices/server/infrastructure/repository/dal/fetch-total-pending";
import type { AppDatabase } from "@/server-core/db/db.connection";

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
