import "server-only";

import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Database } from "@/db/connection";
import type {
  InvoiceEntity,
  InvoiceFormEntity,
  InvoiceServiceEntity,
} from "@/db/models/invoice.entity";
import { customers, invoices, revenues } from "@/db/schema";
import {
  DATA_ERROR_MESSAGES,
  INVOICE_ERROR_MESSAGES,
} from "@/errors/error-messages";
import { DatabaseError, ValidationError } from "@/errors/errors";
import { rawDbToInvoiceEntity } from "@/features/invoices/invoice.mapper";
import type { InvoiceListFilter } from "@/features/invoices/invoice.types";
import { ITEMS_PER_PAGE } from "@/lib/constants/ui.constants";
import { type InvoiceId, toPeriod } from "@/lib/definitions/brands";

/**
 * Creates a new invoice in the database.
 * @param db - Drizzle database instance
 * @param input - Invoice creation data (ORIGIN: dal <-- service <-- formEntity <-- Business Transformation <-- UI )
 * @returns Promise resolving to created InvoiceEntity
 * @throws DatabaseError if creation fails
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
      throw new DatabaseError(INVOICE_ERROR_MESSAGES.CREATE_FAILED, {
        input,
      });
    }

    return rawDbToInvoiceEntity(createdInvoice);
  });
}

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
  // Ensure db and id are not empty
  if (!db || !id) {
    throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_INPUT, { id });
  }

  // db operations
  const [deletedInvoice] = await db
    .delete(invoices)
    .where(eq(invoices.id, id))
    .returning();

  // Check if deletion was successful. Throw error. Propagates up to  Actions layer.
  if (!deletedInvoice) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.DELETE_FAILED, { id });
  }

  // Convert raw database row to InvoiceEntity and return
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
    conditions.push(eq(invoices.date, new Date(filter.date)));
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
      revenuePeriod: invoices.revenuePeriod,
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
      revenuePeriod: invoices.revenuePeriod,
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

/**
 * Fetches the total number of invoices.
 * @param db - Drizzle database instance
 * @returns Total number of invoices as a number.
 */
export async function fetchTotalInvoicesCountDal(
  db: Database,
): Promise<number> {
  try {
    const [result] = await db
      .select({ value: count(invoices.id) })
      .from(invoices);
    return result?.value ?? 0;
  } catch (error) {
    console.error("Database Error:", error);
    throw new DatabaseError(
      DATA_ERROR_MESSAGES.ERROR_FETCH_DASHBOARD_CARDS,
      error,
    );
  }
}

export async function fetchTotalPaidInvoicesDal(db: Database): Promise<number> {
  const paid = await db
    .select({ value: sql<number>`sum(${invoices.amount})` })
    .from(invoices)
    .where(eq(invoices.status, "paid"))
    .then((rows) => rows[0]?.value ?? 0);

  if (paid === undefined) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.FETCH_TOTAL_PAID_FAILED);
  }

  return paid;
}

export async function fetchTotalPendingInvoicesDal(
  db: Database,
): Promise<number> {
  const pending = await db
    .select({ value: sql<number>`sum(${invoices.amount})` })
    .from(invoices)
    .where(eq(invoices.status, "pending"))
    .then((rows) => rows[0]?.value ?? 0);

  if (pending === undefined) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.FETCH_TOTAL_PENDING_FAILED);
  }

  return pending;
}

/**
 * Fetches all paid invoices from the database.
 * @returns Promise resolving to an array of InvoiceEntity
 * @throws DatabaseError if fetching fails or no paid invoices found
 * @throws ValidationError if db is not provided
 * @param db - Drizzle database instance
 */
export async function fetchAllPaidInvoicesDal(
  db: Database,
): Promise<InvoiceEntity[]> {
  if (!db) {
    throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_INPUT, {
      db: "Database instance is required",
    });
  }
  const data = await db
    .select()
    .from(invoices)
    .where(eq(invoices.status, "paid"))
    .orderBy(desc(invoices.date));
  if (!data || data.length === 0) {
    throw new DatabaseError(INVOICE_ERROR_MESSAGES.FETCH_FAILED);
  }
  // Convert raw database rows to InvoiceEntity
  const entities: InvoiceEntity[] = data.map((row) =>
    rawDbToInvoiceEntity(row),
  );
  return entities;
}
