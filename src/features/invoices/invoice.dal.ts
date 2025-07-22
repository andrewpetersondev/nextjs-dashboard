import "server-only";

import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Database } from "@/db/connection";
import type {
  InvoiceEntity,
  InvoiceFormEntity,
} from "@/db/models/invoice.entity";
import { customers, invoices } from "@/db/schema";
import { DatabaseError } from "@/errors/errors";
import type { InvoiceId } from "@/features/invoices/invoice.brands";
import { rawDbToInvoiceEntity } from "@/features/invoices/invoice.mapper";
import type { InvoiceListFilter } from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { ITEMS_PER_PAGE } from "@/lib/constants/ui.constants";

/**
 * Creates a new invoice in the database.
 * @param db - Drizzle database instance
 * @param input - Invoice creation data
 * @returns Promise resolving to created InvoiceEntity
 * @throws DatabaseError if creation fails
 */
export async function createInvoiceDal(
  db: Database,
  input: InvoiceFormEntity,
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
 * @param db - Drizzle database instance
 * @param id - Invoice ID
 * @returns Promise resolving to InvoiceEntity
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
 * @param db - Drizzle database instance
 * @param id - Branded InvoiceId from url
 * @param updateData - Partial invoice data to update which omits `id`
 * @returns Promise resolving to updated InvoiceEntity
 * @throws DatabaseError if update fails or invoice not found
 */
export async function updateInvoiceDal(
  db: Database,
  id: InvoiceId,
  updateData: Partial<InvoiceFormEntity>,
): Promise<InvoiceEntity> {
  // Ensure db, id, and updateData are not empty
  if (!db || !id || !updateData) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.INVALID_INPUT, {
      id,
      updateData,
    });
  }

  // db operations
  const [updated] = await db
    .update(invoices)
    .set(updateData)
    .where(eq(invoices.id, id))
    .returning();

  // Check if update was successful
  if (!updated) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.UPDATE_FAILED, { id });
  }

  // Convert raw database row to InvoiceEntity
  return rawDbToInvoiceEntity(updated);
}

/**
 * Deletes an invoice by ID.
 * @param db - Drizzle database instance
 * @param id - Invoice ID
 * @returns Promise resolving to deleted InvoiceEntity
 * @throws DatabaseError if deletion fails or invoice not found
 */
export async function deleteInvoiceDal(
  db: Database,
  id: InvoiceId,
): Promise<InvoiceEntity> {
  const [deletedInvoice] = await db
    .delete(invoices)
    .where(eq(invoices.id, id))
    .returning();

  if (!deletedInvoice) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.DELETE_FAILED, { id });
  }

  return rawDbToInvoiceEntity(deletedInvoice);
}

/**
 * Lists invoices with pagination and filtering.
 * @param db - Drizzle database instance
 * @param filter - Filtering options for invoices
 * @param page - Current page number (1-based)
 * @param pageSize - Number of items per page
 * @returns Promise resolving to object with entities and total count
 * @throws DatabaseError if query fails
 */
export async function listInvoicesDal(
  db: Database,
  filter: InvoiceListFilter,
  page: number = 1,
  pageSize: number = 20,
): Promise<{ entities: InvoiceEntity[]; total: number }> {
  const offset = (page - 1) * pageSize;

  // Build filter conditions
  const conditions = [];
  if (filter.status) {
    conditions.push(eq(invoices.status, filter.status));
  }
  if (filter.customerId) {
    conditions.push(eq(invoices.customerId, filter.customerId));
  }
  if (filter.date) {
    conditions.push(eq(invoices.date, filter.date));
  }
  // Add more fields as needed

  // Combine conditions with Drizzle's `and` if multiple
  const whereClause =
    conditions.length > 0
      ? { where: conditions.length === 1 ? conditions[0] : and(...conditions) }
      : {};

  // Query with filters
  const [entitiesResult, totalResult] = await Promise.all([
    db
      .select()
      .from(invoices)
      .limit(pageSize)
      .offset(offset)
      .where(whereClause.where),
    db.select({ count: count() }).from(invoices).where(whereClause.where),
  ]);

  const entities = entitiesResult.map(rawDbToInvoiceEntity);
  const total = totalResult[0]?.count ?? 0;

  if (!entities || entities.length === 0 || !total || total < 0) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.FETCH_FAILED, {
      filter,
      page,
      pageSize,
    });
  }

  return { entities, total };
}

/**
 * Fetches the latest invoices with customer information.
 * @param db - Drizzle database instance
 * @param limit - Maximum number of invoices to fetch
 * @returns Promise resolving to array of InvoiceListFilter
 * @throws DatabaseError if query fails
 */
export async function fetchLatestInvoicesDal(
  db: Database,
  limit = 5,
): Promise<InvoiceListFilter[]> {
  const data: InvoiceListFilter[] = await db
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

  if (!data || data.length === 0) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.FETCH_LATEST_FAILED, {
      limit,
    });
  }

  return data;
}

/**
 * Fetches filtered invoices with pagination and customer information.
 * @param db - Drizzle database instance
 * @param query - Search query string
 * @param currentPage - Current page number
 * @returns Promise resolving to array of InvoiceListFilter
 * @throws DatabaseError if query fails
 */
export async function fetchFilteredInvoicesDal(
  db: Database,
  query: string,
  currentPage: number,
): Promise<InvoiceListFilter[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const data: InvoiceListFilter[] = await db
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
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.FETCH_FILTERED_FAILED, {
      currentPage,
      query,
    });
  }

  return data;
}

/**
 * Fetches the total number of invoice pages for pagination.
 * @param db - Drizzle database instance
 * @param query - Search query string
 * @returns Promise resolving to total number of pages
 * @throws DatabaseError if query fails
 */
export async function fetchInvoicesPagesDal(
  db: Database,
  query: string,
): Promise<number> {
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

  if (!total || total < 0) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.FETCH_PAGES_FAILED, {
      query,
      total,
    });
  }

  // Always return at least 1 page for UX consistency
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return Math.max(totalPages, 1);
}
