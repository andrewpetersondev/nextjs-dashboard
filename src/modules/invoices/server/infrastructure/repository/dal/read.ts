import "server-only";
import { eq } from "drizzle-orm";
import type { InvoiceEntity } from "@/modules/invoices/domain/entity";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import { rawDbToInvoiceEntity } from "@/modules/invoices/server/infrastructure/adapters/mappers/invoice.mapper";
import type { AppDatabase } from "@/server-core/db/db.connection";
import { invoices } from "@/server-core/db/schema/invoices";
import type { InvoiceId } from "@/shared/branding/brands";
import { AppError } from "@/shared/errors/core/app-error.class";

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
  if (!(db && id)) {
    throw new AppError("validation", {
      message: INVOICE_MSG.invalidInput,
      metadata: { id },
    });
  }

  const [data] = await db.select().from(invoices).where(eq(invoices.id, id));

  if (!data) {
    throw new AppError("database", {
      message: INVOICE_MSG.notFound,
      metadata: { id },
    });
  }

  const result = rawDbToInvoiceEntity(data);
  if (!result.ok) {
    throw result.error;
  }

  return result.value;
}
