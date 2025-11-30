import "server-only";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { invoices } from "@/server/db/schema/invoices";
import type { InvoiceEntity } from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import type { InvoiceId } from "@/shared/branding/domain-brands";
import { AppError } from "@/shared/errors/core/app-error.class";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";

/**
 * Deletes an invoice by ID.
 * @param db - Drizzle database instance
 * @param id - Invoice ID
 * @returns Promise resolving to deleted InvoiceEntity
 * @throws AppError if deletion fails or invoice not found
 */
export async function deleteInvoiceDal(
  db: AppDatabase,
  id: InvoiceId,
): Promise<InvoiceEntity> {
  // Ensure db and id are not empty
  if (!(db && id)) {
    throw new AppError("validation", {
      message: INVOICE_MSG.invalidInput,
      metadata: { id },
    });
  }

  // db operations
  const [deletedInvoice] = await db
    .delete(invoices)
    .where(eq(invoices.id, id))
    .returning();

  // Check if deletion was successful. Throw error. Propagates up to  Actions layer.
  if (!deletedInvoice) {
    throw new AppError("database", {
      message: INVOICE_MSG.deleteFailed,
      metadata: { id },
    });
  }

  // Convert raw database row to InvoiceEntity and return
  return rawDbToInvoiceEntity(deletedInvoice);
}
