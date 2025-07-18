import "server-only";

import { count, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Database } from "@/db/connection";
import { customers, invoices } from "@/db/schema";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import {
  entityToInvoiceDto,
  rawDbToInvoiceEntity,
} from "@/features/invoices/invoice.mapper";
import type {
  InvoiceCreateInput,
  InvoiceStatus,
  InvoiceTableRow,
} from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { ITEMS_PER_PAGE } from "@/lib/constants/ui.constants";
import type { CustomerId, InvoiceId } from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";

/**
 * Inserts a new invoice into the database and returns a DTO for UI transport.
 *
 * @param db - Drizzle database instance.
 * @param uiInvoiceEntity - Invoice data (all fields except id and sensitiveData).
 * @returns Promise resolving to the created InvoiceDto, or null if creation fails.
 *
 * @remarks
 * - Validates and transforms input before insertion.
 * - Errors are logged with context; no sensitive data is exposed.
 * - Use only branded types for database operations.
 *
 * @example
 * const dto = await createInvoiceDal(db, invoiceEntity);
 * if (!dto) { // handle error  }
 */
export async function createInvoiceDal(
  db: Database,
  uiInvoiceEntity: InvoiceCreateInput,
): Promise<InvoiceDto | null> {
  try {
    const [createdInvoice] = await db
      .insert(invoices)
      .values(uiInvoiceEntity)
      .returning();

    if (!createdInvoice) return null;

    const entity = rawDbToInvoiceEntity(createdInvoice);
    if (!entity) return null;

    const dto = entityToInvoiceDto(entity);
    if (!dto) return null;

    return dto;
  } catch (error) {
    logger.error({
      context: "createInvoiceDal",
      error,
      message: INVOICE_ERROR_MESSAGES.CREATE_FAILED,
      uiInvoiceEntity,
    });
    throw new Error(INVOICE_ERROR_MESSAGES.CREATE_FAILED);
  }
}

/**
 * Fetches an invoice by its ID.
 */
export async function readInvoiceDal(
  db: Database,
  id: InvoiceId,
): Promise<InvoiceDto | null> {
  try {
    const [data] = await db.select().from(invoices).where(eq(invoices.id, id));

    if (!data) return null;

    const entity = rawDbToInvoiceEntity(data);
    if (!entity) return null;

    const dto = entityToInvoiceDto(entity);
    if (!dto) return null;

    return dto;
  } catch (error) {
    logger.error({
      context: "readInvoiceDal",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.READ_FAILED,
    });
    throw new Error(INVOICE_ERROR_MESSAGES.READ_FAILED);
  }
}

/**
 * Updates an existing invoice record in the database.
 */
export async function updateInvoiceDal(
  db: Database,
  id: InvoiceId,
  invoice: { amount: number; status: InvoiceStatus; customerId: CustomerId },
): Promise<InvoiceDto | null> {
  try {
    const [updated] = await db
      .update(invoices)
      .set(invoice)
      .where(eq(invoices.id, id))
      .returning();
    return updated ? entityToInvoiceDto(rawDbToInvoiceEntity(updated)) : null;
  } catch (error) {
    logger.error({
      context: "updateInvoiceDal",
      error,
      id,
      invoice,
      message: INVOICE_ERROR_MESSAGES.UPDATE_FAILED,
    });
    throw new Error(INVOICE_ERROR_MESSAGES.UPDATE_FAILED);
  }
}

/**
 * Deletes an invoice by ID.
 */
export async function deleteInvoiceDal(
  db: Database,
  id: InvoiceId,
): Promise<InvoiceDto | null> {
  try {
    const [deletedInvoice] = await db
      .delete(invoices)
      .where(eq(invoices.id, id))
      .returning();
    return deletedInvoice
      ? entityToInvoiceDto(rawDbToInvoiceEntity(deletedInvoice))
      : null;
  } catch (error) {
    logger.error({
      context: "deleteInvoiceDal",
      error,
      id,
      message: INVOICE_ERROR_MESSAGES.DELETE_FAILED,
    });
    throw new Error(INVOICE_ERROR_MESSAGES.DELETE_FAILED);
  }
}

/**
 * Fetches the latest invoices, limited to 5.
 */
export async function fetchLatestInvoices(
  db: Database,
  limit = 5,
): Promise<InvoiceTableRow[]> {
  try {
    const latestInvoices = await db
      .select({
        amount: invoices.amount,
        customerId: invoices.customerId,
        date: invoices.date,
        email: customers.email,
        id: invoices.id,
        imageUrl: customers.imageUrl,
        name: customers.name,
        status: invoices.status,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .orderBy(desc(invoices.date))
      .limit(limit);

    if (!latestInvoices || latestInvoices.length === 0) {
      logger.warn({
        context: "fetchLatestInvoices",
        limit,
        message: INVOICE_ERROR_MESSAGES.FETCH_LATEST_FAILED,
      });
      throw new Error(INVOICE_ERROR_MESSAGES.FETCH_LATEST_FAILED);
    }
    return latestInvoices;
  } catch (error) {
    logger.error({
      context: "fetchLatestInvoices",
      error,
      limit,
      message: INVOICE_ERROR_MESSAGES.DB_ERROR,
    });
    throw new Error(INVOICE_ERROR_MESSAGES.DB_ERROR);
  }
}

/**
 * Fetches filtered invoices with pagination.
 */
export async function fetchFilteredInvoices(
  db: Database,
  query: string,
  currentPage: number,
): Promise<InvoiceTableRow[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const data: InvoiceTableRow[] = await db
      .select({
        amount: invoices.amount,
        customerId: invoices.customerId,
        date: invoices.date,
        email: customers.email,
        id: invoices.id,
        imageUrl: customers.imageUrl,
        name: customers.name,
        status: invoices.status,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(sql<string>`${invoices.amount}::text`, `%${query}%`),
          ilike(sql<string>`${invoices.date}::text`, `%${query}%`),
          ilike(sql<string>`${invoices.status}::text`, `%${query}%`),
        ),
      )
      .orderBy(desc(invoices.date))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    if (!data || data.length === 0) {
      logger.warn({
        context: "fetchFilteredInvoices",
        currentPage,
        message: INVOICE_ERROR_MESSAGES.FETCH_FILTERED_FAILED,
        query,
      });
    }

    return data;

    // return data.map((invoice) => ({
    //   ...invoice,
    //   amount: formatCurrency(invoice.amount),
    // }));
  } catch (error) {
    logger.error({
      context: "fetchFilteredInvoices",
      currentPage,
      error,
      message: INVOICE_ERROR_MESSAGES.FETCH_FILTERED_FAILED,
      query,
    });
    throw new Error(INVOICE_ERROR_MESSAGES.FETCH_FILTERED_FAILED);
  }
}

/**
 * Fetches the total number of invoice pages for pagination.
 * @param db - Drizzle database instance
 * @param query - Search query string
 * @returns Total number of pages (integer >= 1)
 */
export async function fetchInvoicesPages(
  db: Database,
  query: string,
): Promise<number> {
  try {
    // Count invoices matching the search query
    const [{ count: total = 0 } = { count: 0 }] = await db
      .select({
        count: count(invoices.id),
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(sql<string>`${invoices.amount}::text`, `%${query}%`),
          ilike(sql<string>`${invoices.date}::text`, `%${query}%`),
          ilike(sql<string>`${invoices.status}::text`, `%${query}%`),
        ),
      );
    // Always return at least 1 page for UX consistency
    const pages = Math.ceil(total / ITEMS_PER_PAGE);

    if (!pages || Number.isNaN(pages)) {
      logger.error({
        context: "fetchInvoicesPages",
        message: INVOICE_ERROR_MESSAGES.FETCH_PAGES_FAILED,
        query,
      });
      throw new Error(INVOICE_ERROR_MESSAGES.FETCH_PAGES_FAILED);
    }

    return pages;
  } catch (error) {
    logger.error({
      context: "fetchInvoicesPages",
      error,
      message: INVOICE_ERROR_MESSAGES.FETCH_PAGES_FAILED,
      query,
    });
    throw new Error(INVOICE_ERROR_MESSAGES.FETCH_PAGES_FAILED);
  }
}
