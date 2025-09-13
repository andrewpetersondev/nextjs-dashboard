import "server-only";

import type { Database } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import type {
  InvoiceEntity,
  InvoiceServiceEntity,
} from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import { toPeriod } from "@/shared/domain/id-converters";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";
import { invoices } from "../../../../node-only/schema/invoices";
import { revenues } from "../../../../node-only/schema/revenues";

/**
 * Creates a new invoice in the database.
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
      throw new DatabaseError(INVOICE_MSG.CREATE_FAILED, {
        input,
      });
    }

    return rawDbToInvoiceEntity(createdInvoice);
  });
}
