"use server";
import type { InvoicesSummary } from "@/modules/invoices/application/dto/invoice.dto";
import { fetchTotalInvoicesCountDal } from "@/modules/invoices/infrastructure/repository/dal/fetch-total-invoices-count.dal";
import { fetchTotalPaidInvoicesDal } from "@/modules/invoices/infrastructure/repository/dal/fetch-total-paid-invoices.dal";
import { fetchTotalPendingInvoicesDal } from "@/modules/invoices/infrastructure/repository/dal/fetch-total-pending-invoices.dal";
import type { AppDatabase } from "@/server/db/db.connection";

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
