import "server-only";
import { eq, sql } from "drizzle-orm";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { AppDatabase } from "@/server/db/db.connection";
import { invoices } from "@/server/db/schema/invoices";
import { AppError } from "@/shared/errors/core/app-error.entity";

export async function fetchTotalPaidInvoicesDal(
  db: AppDatabase,
): Promise<number> {
  const paid = await db
    .select({
      value: sql<number>`sum(
            ${invoices.amount}
            )`,
    })
    .from(invoices)
    .where(eq(invoices.status, "paid"))
    .then((rows) => rows[0]?.value ?? 0);

  if (paid === undefined) {
    throw new AppError("database", {
      cause: "",
      message: INVOICE_MSG.fetchTotalPaidFailed,
      metadata: { paid: paid ?? 0 },
    });
  }

  return paid;
}
