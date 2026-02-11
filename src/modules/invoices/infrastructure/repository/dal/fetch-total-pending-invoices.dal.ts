import "server-only";

import { eq, sql } from "drizzle-orm";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { AppDatabase } from "@/server/db/db.connection";
import { invoices } from "@/server/db/schema/invoices";
import { makeAppError } from "@/shared/core/errors/factories/app-error.factory";

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
    throw makeAppError("database", {
      cause: "",
      message: INVOICE_MSG.fetchTotalPendingFailed,
      metadata: {},
    });
  }

  return pending;
}
