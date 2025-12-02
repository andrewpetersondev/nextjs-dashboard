import "server-only";
import { eq } from "drizzle-orm";
import { INVOICE_MSG } from "@/features/invoices/lib/i18n/invoice-messages";
import type { AppDatabase } from "@/server/db/db.connection";
import { invoices } from "@/server/db/schema/invoices";
import type {
  InvoiceEntity,
  InvoiceFormEntity,
} from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import type { InvoiceId } from "@/shared/branding/brands";
import { AppError } from "@/shared/infrastructure/errors/core/app-error.class";

/**
 * Updates an invoice in the database.
 * @param db - Drizzle database instance
 * @param id - Branded InvoiceId from url
 * @param updateData - Partial invoice data to update which omits `id`
 * @returns Promise resolving to updated InvoiceEntity
 * @throws AppError if input parameters are invalid
 * @throws AppError if update fails or invoice not found
 */
export async function updateInvoiceDal(
  db: AppDatabase,
  id: InvoiceId,
  updateData: Partial<InvoiceFormEntity>,
): Promise<InvoiceEntity> {
  if (!(db && id && updateData)) {
    throw new AppError("validation", {
      message: INVOICE_MSG.invalidInput,
    });
  }

  const [updated] = await db
    .update(invoices)
    .set(updateData)
    .where(eq(invoices.id, id))
    .returning();

  if (!updated) {
    throw new AppError("database", { message: INVOICE_MSG.updateFailed });
  }

  const result = rawDbToInvoiceEntity(updated);
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}
