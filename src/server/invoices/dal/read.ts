import "server-only";

import { eq } from "drizzle-orm";
import { INVOICE_ERROR_MESSAGES } from "@/features/invoices/messages";
import type { Database } from "@/server/db/connection";
import { invoices } from "@/server/db/schema";
import { DatabaseError } from "@/server/errors/infrastructure";
import type { InvoiceEntity } from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import type { InvoiceId } from "@/shared/brands/domain-brands";
import { ValidationError } from "@/shared/errors/domain";

/**
 * Reads an invoice by ID.
 * @param db - Drizzle database instance
 * @param id - branded Invoice ID
 * @returns Promise resolving to InvoiceEntity
 * @throws DatabaseError if invoice not found
 * @throws ValidationError if input parameters are invalid
 */
export async function readInvoiceDal(
  db: Database,
  id: InvoiceId,
): Promise<InvoiceEntity> {
  // Basic validation of parameters
  if (!db || !id) {
    throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_INPUT, { id });
  }

  // Fetch invoice by ID
  const [data] = await db.select().from(invoices).where(eq(invoices.id, id));

  // Check if invoice exists
  if (!data) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.NOT_FOUND, { id });
  }

  // Convert raw database row to InvoiceEntity
  return rawDbToInvoiceEntity(data);
}
