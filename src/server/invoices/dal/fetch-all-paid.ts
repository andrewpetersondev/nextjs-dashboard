import "server-only";

import { desc, eq } from "drizzle-orm";
import { INVOICE_ERROR_MESSAGES } from "@/features/invoices/messages";
import type { Database } from "@/server/db/connection";
import { invoices } from "@/server/db/schema";
import { DatabaseError } from "@/server/errors/infrastructure";
import type { InvoiceEntity } from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import { ValidationError_New } from "@/shared/errors/domain";

/**
 * Fetches all paid invoices from the database.
 * @returns Promise resolving to an array of InvoiceEntity
 * @throws DatabaseError if fetching fails or no paid invoices found
 * @throws ValidationError_New if db is not provided
 * @param db - Drizzle database instance
 */
export async function fetchAllPaidInvoicesDal(
  db: Database,
): Promise<InvoiceEntity[]> {
  if (!db) {
    throw new ValidationError_New(INVOICE_ERROR_MESSAGES.INVALID_INPUT, {
      db: "Database instance is required",
    });
  }

  const data = await db
    .select()
    .from(invoices)
    .where(eq(invoices.status, "paid"))
    .orderBy(desc(invoices.date));

  // TODO: Refactor. Empty result does not mean that an error occurred.
  if (!data || data.length === 0) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.FETCH_FAILED);
  }

  // Convert raw database rows to InvoiceEntity
  return data.map((row) => rawDbToInvoiceEntity(row));
}
