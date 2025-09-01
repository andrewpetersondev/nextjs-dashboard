import "server-only";

import { eq, sql } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { invoices } from "@/server/db/schema/schema";
import { DatabaseError } from "@/server/errors/infrastructure";
import { INVOICE_MSG } from "@/shared/invoices/messages";

export async function fetchTotalPendingInvoicesDal(
  db: Database,
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
