import "server-only";

import { and, count, eq } from "drizzle-orm";
import type { InvoiceListFilter } from "@/features/invoices/lib/types";
import type { Database } from "@/server/db/connection";
import { invoices } from "@/server/db/schema/invoices";
import { DatabaseError } from "@/server/errors/infrastructure";
import type { InvoiceEntity } from "@/server/invoices/entity";
import { rawDbToInvoiceEntity } from "@/server/invoices/mapper";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";

/**
 * Lists invoices with pagination and filtering.
 * @param db - Drizzle database instance
 * @param filter - Filtering options for invoices
 * @param page - Current page number (1-based)
 * @param pageSize - Number of items per page
 * @returns Promise resolving to object with entities and total count
 * @throws DatabaseError if query fails
 */
export async function _listInvoicesDal(
  db: Database,
  filter: InvoiceListFilter,
  page = 1,
  pageSize = 20,
): Promise<{ entities: InvoiceEntity[]; total: number }> {
  const offset = (page - 1) * pageSize;

  // Build filter conditions
  // biome-ignore lint/suspicious/noEvolvingTypes: <fix later>
  const conditions = [];

  if (filter.status) {
    conditions.push(eq(invoices.status, filter.status));
  }
  if (filter.customerId) {
    conditions.push(eq(invoices.customerId, filter.customerId));
  }
  if (filter.date) {
    conditions.push(eq(invoices.date, new Date(filter.date)));
  }
  // Add more fields as needed

  // Combine conditions; avoid calling `.where(undefined).
  const whereExpr = (() => {
    if (conditions.length === 0) {
      return;
    }
    if (conditions.length === 1) {
      return conditions[0];
    }
    return and(...conditions);
  })();

  const baseSelect = db.select().from(invoices).limit(pageSize).offset(offset);
  const baseCount = db.select({ count: count() }).from(invoices);

  const [entitiesResult, totalResult] = await Promise.all([
    whereExpr ? baseSelect.where(whereExpr) : baseSelect,
    whereExpr ? baseCount.where(whereExpr) : baseCount,
  ]);

  const entities = entitiesResult.map(rawDbToInvoiceEntity);
  const total = totalResult[0]?.count ?? 0;

  // TODO: Refactor. Empty result does not mean that an error occurred.
  if (!entities || entities.length === 0 || !total || total < 0) {
    throw new DatabaseError(INVOICE_MSG.FETCH_FAILED, {
      filter,
      page,
      pageSize,
    });
  }

  return { entities, total };
}
