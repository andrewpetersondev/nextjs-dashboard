import "server-only";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { invoices } from "@/server/db/schema/invoices";
import type {
  InvoiceEntity,
  InvoiceFormEntity,
} from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import type { InvoiceId } from "@/shared/branding/domain-brands";
import { BaseError } from "@/shared/errors/base-error";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";

/**
 * Updates an invoice in the database.
 * @param db - Drizzle database instance
 * @param id - Branded InvoiceId from url
 * @param updateData - Partial invoice data to update which omits `id`
 * @returns Promise resolving to updated InvoiceEntity
 * @throws BaseError if input parameters are invalid
 * @throws BaseError if update fails or invoice not found
 */
export async function updateInvoiceDal(
  db: AppDatabase,
  id: InvoiceId,
  updateData: Partial<InvoiceFormEntity>,
): Promise<InvoiceEntity> {
  // Ensure db, id, and updateData are not empty
  if (!(db && id && updateData)) {
    throw new BaseError("validation", {
      message: INVOICE_MSG.invalidInput,
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
    throw new BaseError("database", { message: INVOICE_MSG.updateFailed });
  }

  // Convert raw database row to InvoiceEntity
  return rawDbToInvoiceEntity(updated);
}
