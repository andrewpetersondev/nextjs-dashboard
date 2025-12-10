"use server";
import type { InvoicesSummary } from "@/modules/invoices/domain/dto";
import { fetchTotalInvoicesCountDal } from "@/modules/invoices/server/infrastructure/repository/dal/fetch-total-count";
import { fetchTotalPaidInvoicesDal } from "@/modules/invoices/server/infrastructure/repository/dal/fetch-total-paid";
import { fetchTotalPendingInvoicesDal } from "@/modules/invoices/server/infrastructure/repository/dal/fetch-total-pending";
import type { AppDatabase } from "@/server-core/db/db.connection";

export async function readInvoicesSummaryAction(
  db: AppDatabase,
): Promise<InvoicesSummary> {
  const [totalInvoices, totalPending, totalPaid] = await Promise.all([
    fetchTotalInvoicesCountDal(db),
    fetchTotalPendingInvoicesDal(db),
    fetchTotalPaidInvoicesDal(db),
  ]);

  return { totalInvoices, totalPaid, totalPending };
}
