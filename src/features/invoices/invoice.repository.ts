import "server-only";

import type {
  InvoiceEntity,
  InvoiceFormEntity,
  InvoiceFormPartialEntity,
} from "@/db/models/invoice.entity";
import { ValidationError } from "@/errors/errors";
import type { InvoiceId } from "@/features/invoices/invoice.brands";
import {
  createInvoiceDal,
  deleteInvoiceDal,
  listInvoicesDal,
  readInvoiceDal,
  updateInvoiceDal,
} from "@/features/invoices/invoice.dal";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import { entityToInvoiceDto } from "@/features/invoices/invoice.mapper";
import type { InvoiceListFilter } from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { BaseRepository } from "@/lib/repository/base-repository";

/**
 * Repository for Invoice domain operations.
 * It uses DAL functions for DB operations.
 */
export class InvoiceRepository extends BaseRepository<
  InvoiceDto, // TDto - what gets returned to service layer
  InvoiceId, // TId - branded ID type
  InvoiceFormEntity, // TCreateInput - creation input type
  InvoiceFormPartialEntity // TUpdateInput - update input type
> {
  /**
   * Creates an invoice.
   * @param input - Invoice creation data as InvoiceFormEntity
   * @returns Promise resolving to created InvoiceDto returning to Service layer.
   * @throws ValidationError for invalid input
   * @throws DatabaseError for database failures
   */
  async create(input: InvoiceFormEntity): Promise<InvoiceDto> {
    // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
    if (!input || typeof input !== "object") {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.VALIDATION_FAILED);
    }

    // Call DAL with branded entity. Function returns InvoiceEntity.
    const createdEntity: InvoiceEntity = await createInvoiceDal(this.db, input);

    // Transform Entity (branded) → DTO (plain)
    return entityToInvoiceDto(createdEntity);
  }

  /**
   * Reads an invoice by ID.
   * @param id - InvoiceId (branded type)
   * @returns Promise resolving to InvoiceDto
   * @throws ValidationError for invalid parameter id
   * @throws DatabaseError for database failures
   */
  async read(id: InvoiceId): Promise<InvoiceDto> {
    // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    // Call DAL with branded ID
    const entity = await readInvoiceDal(this.db, id);

    // Transform Entity (branded) → DTO (plain)
    return entityToInvoiceDto(entity);
  }

  /**
   * Updates an invoice.
   * @param id - InvoiceId (branded type)
   * @param data - Update data as InvoiceFormPartialEntity
   * @returns Promise resolving to updated InvoiceDto
   * @throws ValidationError for invalid input
   * @throws DatabaseError for database failures
   */
  async update(
    id: InvoiceId,
    data: InvoiceFormPartialEntity,
  ): Promise<InvoiceDto> {
    // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
    if (!data || !id || typeof data !== "object") {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.VALIDATION_FAILED);
    }

    // Call DAL with branded types
    const updatedEntity = await updateInvoiceDal(this.db, id, data);

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
    // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    // Call DAL with branded ID
    const deletedEntity = await deleteInvoiceDal(this.db, id);

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
    const data: InvoiceDto[] = entities.map(entityToInvoiceDto);
    return { data, total };
  }
}
