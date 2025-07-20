import "server-only";

import * as z from "zod";
import type { Database } from "@/db/connection";
import { DatabaseError, ValidationError } from "@/errors/errors";
import {
  createInvoiceDal,
  deleteInvoiceDal,
  listInvoicesDal,
  readInvoiceDal,
  updateInvoiceDal,
} from "@/features/invoices/invoice.dal";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import { entityToInvoiceDto } from "@/features/invoices/invoice.mapper";
import { isInvoiceEntity } from "@/features/invoices/invoice.type-guards";
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
  amount: z.number().positive().max(10000),
  customerId: z.uuid(),
  date: z.iso.date(),
  sensitiveData: z.string().optional(),
  status: z.string().min(1),
});

/**
 * Zod schema for runtime validation of InvoiceUpdateInput.
 */
const InvoiceUpdateSchema = z.object({
  amount: z.number().positive().max(10000).optional(),
  customerId: z.string().min(1).optional(),
  date: z.iso.date().optional(),
  id: z.uuid().optional(),
  sensitiveData: z.string().optional(),
  status: z.string().min(1).optional(),
});

/**
 * Repository for Invoice domain, encapsulating CRUD and list operations.
 * @remarks
 * - Uses granular error types.
 * - Redacts sensitive data in logs.
 * - Supports soft delete, pagination, filtering, and optimistic concurrency.
 * - Accepts a logger for testability.
 */
export class InvoiceRepository extends BaseRepository<InvoiceDto, InvoiceId> {
  private readonly logger: typeof defaultLogger;

  constructor(db: Database, logger: typeof defaultLogger = defaultLogger) {
    super(db);
    this.logger = logger;
  }

  /**
   * Creates an invoice.
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
   * @throws ValidationError for invalid input
   * @throws DatabaseError for database failures
   */
  async update(id: InvoiceId, data: InvoiceUpdateInput): Promise<InvoiceDto> {
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
   * Soft deletes an invoice.
   * @throws {ValidationError|DatabaseError}
   */
  async delete(id: InvoiceId): Promise<InvoiceDto> {
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }
    try {
      const entity = await deleteInvoiceDal(this.db, id);
      if (!isInvoiceEntity(entity)) {
        throw new DatabaseError(INVOICE_ERROR_MESSAGES.DELETE_FAILED, { id });
      }
      return entityToInvoiceDto(entity);
    } catch (error) {
      this.logger.error({
        context: "InvoiceRepository.delete",
        error,
        id,
      });
      throw this.wrapError(error, INVOICE_ERROR_MESSAGES.DELETE_FAILED);
    }
  }

  /**
   * Lists invoices with pagination and filtering.
   */
  async list(
    filter: InvoiceListFilter,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ data: InvoiceDto[]; total: number }> {
    try {
      const { entities, total } = await listInvoicesDal(
        this.db,
        filter,
        page,
        pageSize,
      );
      const data = Array.isArray(entities)
        ? entities.filter(isInvoiceEntity).map(entityToInvoiceDto)
        : [];
      return { data, total };
    } catch (error) {
      this.logger.error({
        context: "InvoiceRepository.list",
        error,
        filter,
        page,
        pageSize,
      });
      throw this.wrapError(error, INVOICE_ERROR_MESSAGES.FETCH_FILTERED_FAILED);
    }
  }

  /**
   * Redacts sensitive fields for logging.
   */
  private redact(obj: unknown): unknown {
    if (!obj || typeof obj !== "object") return obj;
    const clone = { ...obj } as Record<string, unknown>;
    if ("sensitiveData" in clone) clone.sensitiveData = "[REDACTED]";
    return clone;
  }

  /**
   * Wraps unknown errors in a DatabaseError.
   */
  private wrapError(error: unknown, message: string): DatabaseError {
    if (error instanceof ValidationError || error instanceof DatabaseError) {
      return error;
    }
    return new DatabaseError(message, error);
  }
}
