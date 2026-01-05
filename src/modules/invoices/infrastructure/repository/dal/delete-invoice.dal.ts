import "server-only";

import { eq } from "drizzle-orm";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceEntity } from "@/modules/invoices/domain/invoice.entity";
import { rawDbToInvoiceEntity } from "@/modules/invoices/infrastructure/adapters/mappers/invoice.mapper";
import type { AppDatabase } from "@/server/db/db.connection";
import { invoices } from "@/server/db/schema/invoices";
import type { InvoiceId } from "@/shared/branding/brands";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

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
    throw makeAppError("validation", {
      cause: "",
      message: INVOICE_MSG.invalidInput,
      metadata: {},
    });
  }

  // db operations
  const [deletedInvoice] = await db
    .delete(invoices)
    .where(eq(invoices.id, id))
    .returning();

  // Check if deletion was successful. Throw error. Propagates up to  Actions layer.
  if (!deletedInvoice) {
    throw makeAppError("database", {
      cause: "",
      message: INVOICE_MSG.deleteFailed,
      metadata: {},
    });
  }

  const result = rawDbToInvoiceEntity(deletedInvoice);
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}
