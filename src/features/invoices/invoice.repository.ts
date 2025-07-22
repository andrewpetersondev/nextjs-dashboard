import "server-only";

import type { Database } from "@/db/connection";
import { ValidationError } from "@/errors/errors";
import { BaseRepository } from "@/features/invoices/base-repository";
import {
  createInvoiceDal,
  deleteInvoiceDal,
  listInvoicesDal,
  readInvoiceDal,
  updateInvoiceDal,
} from "@/features/invoices/invoice.dal";
import type {
  CreateInvoiceDto,
  InvoiceDto,
  UpdateInvoiceDto,
} from "@/features/invoices/invoice.dto";
import {
  dtoToCreateInvoiceEntity,
  entityToInvoiceDto,
  partialDtoToCreateInvoiceEntity,
} from "@/features/invoices/invoice.mapper";
import type { InvoiceListFilter } from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { type InvoiceId, toInvoiceId } from "@/lib/definitions/brands";
import { logger as defaultLogger } from "@/lib/utils/logger";

/**
 * Repository for Invoice domain operations.
 * Transforms DTOs (plain) ↔ Entities (branded).
 * NO schema validation - that's service layer responsibility.
 * Handles validation and error transformation between Service and DAL layers.
 */
export class InvoiceRepository extends BaseRepository<
  InvoiceDto, // TDto - what gets returned to service layer
  InvoiceId, // TId - branded ID type
  CreateInvoiceDto, // TCreateInput - creation input type
  UpdateInvoiceDto // TUpdateInput - update input type
> {
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
  async create(input: CreateInvoiceDto): Promise<InvoiceDto> {
    // Basic validation only -- no schema validation
    if (!input || typeof input !== "object") {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.VALIDATION_FAILED);
    }

    // Transform DTO (plain) → Entity (branded)
    const entity = dtoToCreateInvoiceEntity(input);

    // Call DAL with branded entity
    const createdEntity = await createInvoiceDal(this.db, entity);

    // Transform Entity (branded) → DTO (plain)
    return entityToInvoiceDto(createdEntity);
  }

  /**
   * Reads an invoice by ID.
   * @param id - string
   * @returns Promise resolving to InvoiceDto
   * @throws ValidationError for invalid ID
   * @throws DatabaseError for database failures
   */
  async read(id: string): Promise<InvoiceDto> {
    // Basic validation only -- no schema validation
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    // Transform plain string → branded ID
    const invoiceId = toInvoiceId(id);

    // Call DAL with branded ID
    const entity = await readInvoiceDal(this.db, invoiceId);

    // Transform Entity (branded) → DTO (plain)
    return entityToInvoiceDto(entity);
  }

  /**
   * Updates an invoice.
   * @param id - InvoiceId (branded type)
   * @param data - Update data
   * @returns Promise resolving to updated InvoiceDto
   * @throws ValidationError for invalid input
   * @throws DatabaseError for database failures
   */
  async update(id: InvoiceId, data: UpdateInvoiceDto): Promise<InvoiceDto> {
    // Basic validation only -- no schema validation
    if (!data || !id || typeof data !== "object") {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.VALIDATION_FAILED);
    }

    // Transform DTO (plain) → Entity (branded)
    const updateEntity = partialDtoToCreateInvoiceEntity(data);

    // Call DAL with branded types
    const updatedEntity = await updateInvoiceDal(this.db, id, updateEntity);

    // Transform Entity (branded) → DTO (plain)
    return entityToInvoiceDto(updatedEntity);
  }

  /**
   * Deletes an invoice.
   * @param id - InvoiceId (branded type)
   * @returns Promise resolving to deleted InvoiceDto
   * @throws ValidationError for invalid ID
   * @throws DatabaseError for database failures
   */
  async delete(id: InvoiceId): Promise<InvoiceDto> {
    // Basic validation only -- no schema validation
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    // Transform plain string → branded ID
    const invoiceId = toInvoiceId(id);

    // Call DAL with branded ID
    const deletedEntity = await deleteInvoiceDal(this.db, invoiceId);

    // Transform Entity (branded) → DTO (plain)
    return entityToInvoiceDto(deletedEntity);
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
