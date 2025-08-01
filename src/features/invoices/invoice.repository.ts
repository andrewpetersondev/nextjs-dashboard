import "server-only";

import type {
  InvoiceEntity,
  InvoiceFormEntity,
  InvoiceFormPartialEntity,
} from "@/db/models/invoice.entity";
import { DatabaseError, ValidationError } from "@/errors/errors";
import {
  createInvoiceDal,
  deleteInvoiceDal,
  fetchAllPaidInvoicesDal,
  readInvoiceDal,
  updateInvoiceDal,
} from "@/features/invoices/invoice.dal";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import { entityToInvoiceDto } from "@/features/invoices/invoice.mapper";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { InvoiceId } from "@/lib/definitions/brands";
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
   * Finds an invoice by ID.
   * @param id - InvoiceId (branded type)
   * @returns Promise resolving to InvoiceEntity
   * @throws ValidationError for invalid parameter id
   * @throws DatabaseError for database failures
   */
  async findById(id: InvoiceId): Promise<InvoiceEntity> {
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }
    const entity: InvoiceEntity = await readInvoiceDal(this.db, id);
    if (!entity) {
      throw new DatabaseError(INVOICE_ERROR_MESSAGES.NOT_FOUND, { id });
    }
    return entity;
  }

  /**
   * Finds all invoices.
   * @returns Promise resolving to array of InvoiceEntity
   * @throws DatabaseError for database failures
   */
  async findAll(): Promise<InvoiceEntity[]> {
    const invoices: InvoiceEntity[] = await fetchAllPaidInvoicesDal(this.db);
    if (!invoices) {
      throw new DatabaseError(INVOICE_ERROR_MESSAGES.NOT_FOUND);
    }
    return invoices;
  }
}
