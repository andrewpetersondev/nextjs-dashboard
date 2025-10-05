import "server-only";

import { eq, sql } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { invoices } from "@/server/db/schema/invoices";
import { DatabaseError } from "@/server/errors/infrastructure";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";

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
    throw new DatabaseError(INVOICE_MSG.FETCH_TOTAL_PENDING_FAILED);
  }

  return pending;
}
