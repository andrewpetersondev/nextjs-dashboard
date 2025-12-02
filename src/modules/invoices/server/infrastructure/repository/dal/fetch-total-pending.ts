import "server-only";
import { eq, sql } from "drizzle-orm";
import { INVOICE_MSG } from "@/modules/invoices/lib/i18n/invoice-messages";
import type { AppDatabase } from "@/server/db/db.connection";
import { invoices } from "@/server/db/schema/invoices";
import { AppError } from "@/shared/errors/core/app-error.class";

export async function fetchTotalPendingInvoicesDal(
  db: AppDatabase,
): Promise<number> {
  const pending = await db
    .select({
      value: sql<number>`sum(
            ${invoices.amount}
            )`,
    })
    .from(invoices)
    .where(eq(invoices.status, "pending"))
    .then((rows) => rows[0]?.value ?? 0);

  if (pending === undefined) {
    throw new AppError("database", {
      message: INVOICE_MSG.fetchTotalPendingFailed,
    });
  }

  return pending;
}
