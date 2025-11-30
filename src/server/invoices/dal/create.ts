import "server-only";
import type { AppDatabase } from "@/server/db/db.connection";
import { invoices } from "@/server/db/schema/invoices";
import { revenues } from "@/server/db/schema/revenues";
import type {
  InvoiceEntity,
  InvoiceServiceEntity,
} from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import { toPeriod } from "@/shared/branding/id-converters";
import { AppError } from "@/shared/errors/app-error";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";

/**
 * Creates a new invoice in the database.
 */
export async function createInvoiceDal(
  db: AppDatabase,
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
      throw new AppError("database", {
        context: {
          input,
        },
        message: INVOICE_MSG.createFailed,
      });
    }

    return rawDbToInvoiceEntity(createdInvoice);
  });
}
