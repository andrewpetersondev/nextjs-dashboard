import "server-only";

import { count, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Db } from "@/db/connection";
import { customers, invoices } from "@/db/schema";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import {
  toInvoiceDto,
  toInvoiceEntity,
} from "@/features/invoices/invoice.mapper";
import type {
  FetchFilteredInvoicesData,
  InvoiceCreateInput,
  InvoiceTableRow,
  InvoiceUpdateInput,
  LatestInvoiceRow,
} from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { ITEMS_PER_PAGE } from "@/lib/constants/ui.constants";
import type { InvoiceId } from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";
import { formatCurrency } from "@/lib/utils/utils";

/**
 * Inserts a new invoice record into the database.
 */
export async function createInvoiceDal(
  db: Db,
  invoice: InvoiceCreateInput,
): Promise<InvoiceDto | null> {
  try {
    const [createdInvoice] = await db
      .insert(invoices)
      .values(invoice)
      .returning();
    if (!createdInvoice) return null;
    const entity = toInvoiceEntity(createdInvoice);
    if (!entity) return null;
    return toInvoiceDto(entity);
  } catch (error) {
    logger.error({
      context: "createInvoiceDal",
      error,
      invoice,
      message: INVOICE_ERROR_MESSAGES.CREATE_FAILED,
    });
    throw new Error(INVOICE_ERROR_MESSAGES.CREATE_FAILED);
  }
}

/**
 * Fetches an invoice by its ID.
 */
export async function readInvoiceDal(
  db: Db,
  id: InvoiceId,
): Promise<InvoiceDto | null> {
  try {
    const [data] = await db.select().from(invoices).where(eq(invoices.id, id));

    if (!data) return null;

    const entity = toInvoiceEntity(data);
    if (!entity) return null;

    const dto = toInvoiceDto(entity);
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
  db: Db,
  id: InvoiceId,
  invoice: InvoiceUpdateInput,
): Promise<InvoiceDto | null> {
  try {
    const [updated] = await db
      .update(invoices)
      .set(invoice)
      .where(eq(invoices.id, id))
      .returning();
    return updated ? toInvoiceDto(toInvoiceEntity(updated)) : null;
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
  db: Db,
  id: InvoiceId,
): Promise<InvoiceDto | null> {
  try {
    const [deletedInvoice] = await db
      .delete(invoices)
      .where(eq(invoices.id, id))
      .returning();
    return deletedInvoice
      ? toInvoiceDto(toInvoiceEntity(deletedInvoice))
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
  db: Db,
  limit = 5,
): Promise<LatestInvoiceRow[]> {
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
    return latestInvoices.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
  } catch (error) {
    logger.error({
      context: "fetchLatestInvoices",
      error,
      limit,
      message: INVOICE_ERROR_MESSAGES.FETCH_LATEST_FAILED,
    });
    throw new Error(INVOICE_ERROR_MESSAGES.FETCH_LATEST_FAILED);
  }
}

/**
 * Fetches filtered invoices with pagination.
 */
export async function fetchFilteredInvoices(
  db: Db,
  query: string,
  currentPage: number,
): Promise<FetchFilteredInvoicesData[]> {
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

    return data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
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
 */
export async function fetchInvoicesPages(
  db: Db,
  query: string,
): Promise<number> {
  try {
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
    return Math.ceil(total / ITEMS_PER_PAGE);
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
