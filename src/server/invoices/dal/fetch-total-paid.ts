import "server-only";

import { eq, sql } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { invoices } from "@/server/db/schema/invoices";
import { DatabaseError } from "@/server/errors/infrastructure";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";

export async function fetchTotalPaidInvoicesDal(db: Database): Promise<number> {
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
    throw new DatabaseError(INVOICE_MSG.FETCH_TOTAL_PAID_FAILED);
  }

  return paid;
}
