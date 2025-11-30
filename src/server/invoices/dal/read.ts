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
 * Reads an invoice by ID.
 * @param db - Drizzle database instance
 * @param id - branded Invoice ID
 * @returns Promise resolving to InvoiceEntity
 * @throws AppError if invoice not found
 * @throws AppError if input parameters are invalid
 */
export async function readInvoiceDal(
  db: AppDatabase,
  id: InvoiceId,
): Promise<InvoiceEntity> {
  // Basic validation of parameters
  if (!(db && id)) {
    throw new AppError("validation", {
      message: INVOICE_MSG.invalidInput,
      metadata: { id },
    });
  }

  // Fetch invoice by ID
  const [data] = await db.select().from(invoices).where(eq(invoices.id, id));

  // Check if invoice exists
  if (!data) {
    throw new AppError("database", {
      message: INVOICE_MSG.notFound,
      metadata: { id },
    });
  }

  // Convert raw database row to InvoiceEntity
  return rawDbToInvoiceEntity(data);
}
