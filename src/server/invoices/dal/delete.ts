import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { invoices } from "@/server/db/schema/schema";
import { DatabaseError } from "@/server/errors/infrastructure";
import type { InvoiceEntity } from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import type { InvoiceId } from "@/shared/brands/domain-brands";
import { ValidationError } from "@/shared/errors/domain";
import { INVOICE_MSG } from "@/shared/invoices/messages";

/**
 * Deletes an invoice by ID.
 * @param db - Drizzle database instance
 * @param id - Invoice ID
 * @returns Promise resolving to deleted InvoiceEntity
 * @throws DatabaseError if deletion fails or invoice not found
 */
export async function deleteInvoiceDal(
  db: Database,
  id: InvoiceId,
): Promise<InvoiceEntity> {
  // Ensure db and id are not empty
  if (!db || !id) {
    throw new ValidationError(INVOICE_MSG.INVALID_INPUT, { id });
  }

  // db operations
  const [deletedInvoice] = await db
    .delete(invoices)
    .where(eq(invoices.id, id))
    .returning();

  // Check if deletion was successful. Throw error. Propagates up to  Actions layer.
  if (!deletedInvoice) {
    throw new DatabaseError(INVOICE_MSG.DELETE_FAILED, { id });
  }

  // Convert raw database row to InvoiceEntity and return
  return rawDbToInvoiceEntity(deletedInvoice);
}
