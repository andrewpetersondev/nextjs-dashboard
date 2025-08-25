import "server-only";

import { eq } from "drizzle-orm";
import { INVOICE_ERROR_MESSAGES } from "@/features/invoices/messages";
import type { Database } from "@/server/db/connection";
import { invoices } from "@/server/db/schema";
import { DatabaseError_New } from "@/server/errors/infrastructure";
import type {
  InvoiceEntity,
  InvoiceFormEntity,
} from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import type { InvoiceId } from "@/shared/brands/domain-brands";
import { ValidationError_New } from "@/shared/errors/domain";

/**
 * Updates an invoice in the database.
 * @param db - Drizzle database instance
 * @param id - Branded InvoiceId from url
 * @param updateData - Partial invoice data to update which omits `id`
 * @returns Promise resolving to updated InvoiceEntity
 * @throws ValidationError_New if input parameters are invalid
 * @throws DatabaseError_New if update fails or invoice not found
 */
export async function updateInvoiceDal(
  db: Database,
  id: InvoiceId,
  updateData: Partial<InvoiceFormEntity>,
): Promise<InvoiceEntity> {
  // Ensure db, id, and updateData are not empty
  if (!db || !id || !updateData) {
    throw new ValidationError_New(INVOICE_ERROR_MESSAGES.INVALID_INPUT, {
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
    throw new DatabaseError_New(INVOICE_ERROR_MESSAGES.UPDATE_FAILED, { id });
  }

  // Convert raw database row to InvoiceEntity
  return rawDbToInvoiceEntity(updated);
}
