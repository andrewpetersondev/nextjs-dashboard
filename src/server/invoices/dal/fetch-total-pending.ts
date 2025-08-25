import "server-only";

import { eq, sql } from "drizzle-orm";
import { INVOICE_ERROR_MESSAGES } from "@/features/invoices/messages";
import type { Database } from "@/server/db/connection";
import { invoices } from "@/server/db/schema";
import { DatabaseError_New } from "@/server/errors/infrastructure";

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
    throw new DatabaseError_New(
      INVOICE_ERROR_MESSAGES.FETCH_TOTAL_PENDING_FAILED,
    );
  }

  return pending;
}
