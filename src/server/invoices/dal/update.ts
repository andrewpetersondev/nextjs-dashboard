import "server-only";

import { eq } from "drizzle-orm";
import type { Database } from "@/server/db/connection";
import { invoices } from "@/server/db/schema/invoices";
import { DatabaseError } from "@/server/errors/infrastructure";
import type {
  InvoiceEntity,
  InvoiceFormEntity,
} from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import { ValidationError } from "@/shared/core/errors/domain";
import type { InvoiceId } from "@/shared/domain/domain-brands";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";

/**
 * Updates an invoice in the database.
 * @param db - Drizzle database instance
 * @param id - Branded InvoiceId from url
 * @param updateData - Partial invoice data to update which omits `id`
 * @returns Promise resolving to updated InvoiceEntity
 * @throws ValidationError if input parameters are invalid
 * @throws DatabaseError if update fails or invoice not found
 */
export async function updateInvoiceDal(
  db: Database,
  id: InvoiceId,
  updateData: Partial<InvoiceFormEntity>,
): Promise<InvoiceEntity> {
  // Ensure db, id, and updateData are not empty
  if (!db || !id || !updateData) {
    throw new ValidationError(INVOICE_MSG.INVALID_INPUT, {
      id,
      updateData,
    });
  }

  // db operations
  const [updated] = await db
    .update(invoices)
    .set(updateData)
    .where(eq(invoices.id, id))
    .returning();

  // Check if update was successful
  if (!updated) {
    throw new DatabaseError(INVOICE_MSG.UPDATE_FAILED, { id });
  }

  // Convert raw database row to InvoiceEntity
  return rawDbToInvoiceEntity(updated);
}
