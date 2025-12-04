import "server-only";
import { eq } from "drizzle-orm";
import { INVOICE_MSG } from "@/modules/invoices/lib/i18n/invoice-messages";
import type { InvoiceEntity } from "@/modules/invoices/server/domain/entity";
import { rawDbToInvoiceEntity } from "@/modules/invoices/server/infrastructure/adapters/mappers/invoice.mapper";
import type { AppDatabase } from "@/server-core/db/db.connection";
import { invoices } from "@/server-core/db/schema/invoices";
import type { InvoiceId } from "@/shared/branding/brands";
import { AppError } from "@/shared/errors/core/app-error.class";

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

  const result = rawDbToInvoiceEntity(deletedInvoice);
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}
