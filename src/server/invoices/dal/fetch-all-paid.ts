import "server-only";

import { desc, eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { invoices } from "@/server/db/schema/invoices";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import type { InvoiceEntity } from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import { ValidationError } from "@/shared/core/errors/domain/domain-errors";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";

/**
 * Fetches all paid invoices from the database.
 * @returns Promise resolving to an array of InvoiceEntity
 * @throws DatabaseError if fetching fails or no paid invoices found
 * @throws ValidationError if db is not provided
 * @param db - Drizzle database instance
 */
export async function fetchAllPaidInvoicesDal(
  db: AppDatabase,
): Promise<InvoiceEntity[]> {
  if (!db) {
    throw new ValidationError(INVOICE_MSG.INVALID_INPUT, {
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
    throw new DatabaseError(INVOICE_MSG.FETCH_FAILED);
  }

  // Convert raw database rows to InvoiceEntity
  return data.map((row) => rawDbToInvoiceEntity(row));
}
