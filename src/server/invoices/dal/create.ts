import "server-only";

import { INVOICE_ERROR_MESSAGES } from "@/features/invoices/messages";
import type { Database } from "@/server/db/connection";
import { invoices, revenues } from "@/server/db/schema";
import { DatabaseError_New } from "@/server/errors/infrastructure";
import type {
  InvoiceEntity,
  InvoiceServiceEntity,
} from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import { toPeriod } from "@/shared/brands/domain-brands";

/**
 * Creates a new invoice in the database.
 * @param db - Drizzle database instance
 * @param input - Invoice creation data (ORIGIN: dal <-- service <-- formEntity <-- Business Transformation <-- UI )
 * @returns Promise resolving to created InvoiceEntity
 * @throws DatabaseError_New if creation fails
 */
export async function createInvoiceDal(
  db: Database,
  input: InvoiceServiceEntity,
): Promise<InvoiceEntity> {
  // We must ensure the referenced revenues.period exists due to FK.
  // Use a transaction to:
  // 1) Upsert the revenue period (no-op if it already exists)
  // 2) Insert the invoice with the derived revenuePeriod
  return await db.transaction(async (tx) => {
    // Upsert the revenue period row so FK doesn't fail.
    // Only period is required here; other fields use defaults.
    await tx
      .insert(revenues)
      .values({ period: toPeriod(input.revenuePeriod) })
      .onConflictDoNothing({ target: revenues.period });

    // Insert the invoice including revenuePeriod.
    const [createdInvoice] = await tx
      .insert(invoices)
      .values(input)
      .returning();

    if (!createdInvoice) {
      throw new DatabaseError_New(INVOICE_ERROR_MESSAGES.CREATE_FAILED, {
        input,
      });
    }

    return rawDbToInvoiceEntity(createdInvoice);
  });
}
