import "server-only";

import { count, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Database } from "@/db/connection";
import type { InvoiceEntity } from "@/db/models/invoice.entity";
import { customers, invoices } from "@/db/schema";
import { DatabaseError } from "@/errors/errors";
import { rawDbToInvoiceEntity } from "@/features/invoices/invoice.mapper";
import type {
  InvoiceCreateInput,
  InvoiceListFilter,
  InvoiceStatus,
  InvoiceTableRow,
} from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { ITEMS_PER_PAGE } from "@/lib/constants/ui.constants";
import type { CustomerId, InvoiceId } from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";

/**
 * Inserts a new invoice into the database and returns an Entity for Server transport.
 *
 * @param db - Drizzle database instance.
 * @param input - Invoice data (all fields except id and sensitiveData).
 * @returns Promise resolving to the created InvoiceEntity.
 * @throws DatabaseError if creation fails.
 */
export async function createInvoiceDal(
  db: Database,
  input: InvoiceCreateInput,
): Promise<InvoiceEntity> {
  const [createdInvoice] = await db.insert(invoices).values(input).returning();

  if (!createdInvoice) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.CREATE_FAILED, {
      input,
    });
  }

  return rawDbToInvoiceEntity(createdInvoice);
}

/**
 * Reads an invoice by ID.
 * @throws DatabaseError if invoice not found
 */
export async function readInvoiceDal(
  db: Database,
  id: InvoiceId,
): Promise<InvoiceEntity> {
  const [data] = await db.select().from(invoices).where(eq(invoices.id, id));

  if (!data) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.NOT_FOUND, { id });
  }

  return rawDbToInvoiceEntity(data);
}

/**
 * Updates an invoice in the database.
 * @throws DatabaseError if update fails or invoice not found
 */
export async function updateInvoiceDal(
  db: Database,
  id: InvoiceId,
  invoice: { amount: number; status: InvoiceStatus; customerId: CustomerId },
): Promise<InvoiceEntity> {
  const [updated] = await db
    .update(invoices)
    .set(invoice)
    .where(eq(invoices.id, id))
    .returning();

  if (!updated) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.UPDATE_FAILED, { id });
  }

  return rawDbToInvoiceEntity(updated);
}

/**
 * @remarks
 * Needs to be updated to not return null. needs to follow pattern of create, read, update.
 * Deletes an invoice by ID.
 */
export async function deleteInvoiceDal(
  db: Database,
  id: InvoiceId,
): Promise<InvoiceEntity | null> {
  try {
    const [deletedInvoice] = await db
      .delete(invoices)
      .where(eq(invoices.id, id))
      .returning();

    if (!deletedInvoice) return null;

    const entity = rawDbToInvoiceEntity(deletedInvoice);

    if (!entity) return null;

    return entity;
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
 * Lists invoices with pagination and filtering.
 * @param db - Drizzle database instance
 * @param filter - Filtering options for invoices
 * @param page - Current page number (1-based)
 * @param pageSize - Number of items per page
 * @returns Promise resolving to an object with entities and total count
 */
export async function listInvoicesDal(
  db: Database,
  filter: InvoiceListFilter,
  page: number = 1,
  pageSize: number = 20,
): Promise<{ entities: InvoiceEntity[]; total: number }> {
  console.log("listInvoicesDal not implemented yet");
  console.log("filter", filter);
  console.log("page", page);
  console.log("pageSize", pageSize);
  console.log("db", db);

  return { entities: [], total: 0 };
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
        sensitiveData: invoices.sensitiveData,
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
        sensitiveData: customers.sensitiveData,
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
