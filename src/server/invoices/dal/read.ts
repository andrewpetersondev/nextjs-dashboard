import "server-only";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/db.connection";
import { invoices } from "@/server/db/schema/invoices";
import type { InvoiceEntity } from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import type { InvoiceId } from "@/shared/branding/domain-brands";
import {
  DatabaseError,
  ValidationError,
} from "@/shared/errors/base-error.subclasses";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";

/**
 * Reads an invoice by ID.
 * @param db - Drizzle database instance
 * @param id - branded Invoice ID
 * @returns Promise resolving to InvoiceEntity
 * @throws DatabaseError if invoice not found
 * @throws ValidationError if input parameters are invalid
 */
export async function readInvoiceDal(
  db: AppDatabase,
  id: InvoiceId,
): Promise<InvoiceEntity> {
  // Basic validation of parameters
  if (!(db && id)) {
    throw new ValidationError(INVOICE_MSG.invalidInput, { id });
  }

  // Fetch invoice by ID
  const [data] = await db.select().from(invoices).where(eq(invoices.id, id));

  // Check if invoice exists
  if (!data) {
    throw new DatabaseError(INVOICE_MSG.notFound, { id });
  }

  // Convert raw database row to InvoiceEntity
  return rawDbToInvoiceEntity(data);
}
