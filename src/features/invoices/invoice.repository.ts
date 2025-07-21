import "server-only";

import * as z from "zod";
import type { Database } from "@/db/connection";
import { ValidationError } from "@/errors/errors";
import {
  createInvoiceDal,
  deleteInvoiceDal,
  listInvoicesDal,
  readInvoiceDal,
  updateInvoiceDal,
} from "@/features/invoices/invoice.dal";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import { entityToInvoiceDto } from "@/features/invoices/invoice.mapper";
import type {
  InvoiceCreateInput,
  InvoiceListFilter,
  InvoiceUpdateInput,
} from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { InvoiceId } from "@/lib/definitions/brands";
import { BaseRepository } from "@/lib/repository/base-repository";
import { logger as defaultLogger } from "@/lib/utils/logger";

/**
 * Zod schema for runtime validation of InvoiceCreateInput.
 */
const InvoiceCreateSchema = z.object({
  amount: z.number().positive().max(1000000),
  customerId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sensitiveData: z.string().optional().default(""),
  status: z.enum(["pending", "paid"]),
});

/**
 * Zod schema for runtime validation of InvoiceUpdateInput.
 */
const InvoiceUpdateSchema = z.object({
  amount: z.number().positive().max(1000000).optional(),
  customerId: z.string().uuid().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  id: z.string().uuid().optional(),
  sensitiveData: z.string().optional(),
  status: z.enum(["pending", "paid"]).optional(),
});

/**
 * Repository for Invoice domain operations.
 * Handles validation and error transformation between Service and DAL layers.
 */
export class InvoiceRepository extends BaseRepository<InvoiceDto, InvoiceId> {
  private readonly logger: typeof defaultLogger;

  constructor(db: Database, logger: typeof defaultLogger = defaultLogger) {
    super(db);
    this.logger = logger;
  }

  /**
   * Creates an invoice.
   * @param input - Invoice creation data
   * @returns Promise resolving to created InvoiceDto
   * @throws ValidationError for invalid input
   * @throws DatabaseError for database failures
   */
  async create(input: InvoiceCreateInput): Promise<InvoiceDto> {
    // 1. Validate input
    const parseResult = InvoiceCreateSchema.safeParse(input);

    if (!parseResult.success) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.VALIDATION_FAILED, {
        issues: parseResult.error.issues,
      });
    }

    // 2. Call DAL - let database errors bubble up
    const entity = await createInvoiceDal(this.db, input);

    // 3. Transform and return
    return entityToInvoiceDto(entity);
  }

  /**
   * Reads an invoice by ID.
   * @param id - Invoice ID
   * @returns Promise resolving to InvoiceDto
   * @throws ValidationError for invalid ID
   * @throws DatabaseError for database failures
   */
  async read(id: InvoiceId): Promise<InvoiceDto> {
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    // Call DAL - let database errors bubble up
    const entity = await readInvoiceDal(this.db, id);

    return entityToInvoiceDto(entity);
  }

  /**
   * Updates an invoice.
   * @param id - Invoice ID
   * @param data - Update data
   * @returns Promise resolving to updated InvoiceDto
   * @throws ValidationError for invalid input
   * @throws DatabaseError for database failures
   */
  async update(
    id: InvoiceId,
    data: Partial<InvoiceUpdateInput>,
  ): Promise<InvoiceDto> {
    // 1. Validate input
    const parseResult = InvoiceUpdateSchema.safeParse({ ...data, id });
    if (!parseResult.success) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.VALIDATION_FAILED, {
        issues: parseResult.error.issues,
      });
    }

    // 2. Call DAL - let database errors bubble up
    const entity = await updateInvoiceDal(this.db, id, data);

    // 3. Transform and return
    return entityToInvoiceDto(entity);
  }

  /**
   * Deletes an invoice.
   * @param id - Invoice ID
   * @returns Promise resolving to deleted InvoiceDto
   * @throws ValidationError for invalid ID
   * @throws DatabaseError for database failures
   */
  async delete(id: InvoiceId): Promise<InvoiceDto> {
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }
    // Call DAL - let database errors bubble up
    const entity = await deleteInvoiceDal(this.db, id);

    return entityToInvoiceDto(entity);
  }

  /**
   * Lists invoices with pagination and filtering.
   * @param filter - Filtering options
   * @param page - Current page number
   * @param pageSize - Number of items per page
   * @returns Promise resolving to paginated invoice data
   */
  async list(
    filter: InvoiceListFilter,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ data: InvoiceDto[]; total: number }> {
    const { entities, total } = await listInvoicesDal(
      this.db,
      filter,
      page,
      pageSize,
    );
    const data = entities.map(entityToInvoiceDto);
    return { data, total };
  }
}
