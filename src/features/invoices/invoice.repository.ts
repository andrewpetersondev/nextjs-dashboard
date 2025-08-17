import "server-only";

import {
  createInvoiceDal,
  deleteInvoiceDal,
  fetchAllPaidInvoicesDal,
  readInvoiceDal,
  updateInvoiceDal,
} from "@/features/invoices/invoice.dal";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type {
  InvoiceEntity,
  InvoiceFormPartialEntity,
  InvoiceServiceEntity,
} from "@/features/invoices/invoice.entity";
import { entityToInvoiceDto } from "@/features/invoices/invoice.mapper";
import type { InvoiceId } from "@/lib/core/brands";
import { Err, fromPromise, Ok, type Result } from "@/lib/core/result";
import {
  type DatabaseError_New,
  ValidationError_New,
} from "@/lib/errors/domain.error";
import { INVOICE_ERROR_MESSAGES } from "@/lib/errors/error-messages";
import { BaseRepository } from "@/lib/repository/base-repository";

/**
 * Repository for Invoice domain operations.
 * It uses DAL functions for DB operations.
 */
export class InvoiceRepository extends BaseRepository<
  InvoiceDto, // TDto - what gets returned to service layer
  InvoiceId, // TId - branded ID type
  InvoiceServiceEntity, // TCreateInput - creation input type
  InvoiceFormPartialEntity // TUpdateInput - update input type
> {
  /**
   * "Safe" create: returns Result instead of throwing.
   */
  async createSafe(
    input: InvoiceServiceEntity,
  ): Promise<Result<InvoiceDto, ValidationError_New | DatabaseError_New>> {
    if (!input || typeof input !== "object") {
      return Err(
        new ValidationError_New(INVOICE_ERROR_MESSAGES.VALIDATION_FAILED),
      );
    }

    const createdEntityRes = (await fromPromise(
      createInvoiceDal(this.db, input),
    )) as Result<InvoiceEntity, ValidationError_New | DatabaseError_New>;

    if (!createdEntityRes.success) return createdEntityRes;

    return Ok(entityToInvoiceDto(createdEntityRes.data));
  }

  /**
   * Repo method to create an invoice.
   * - Accepts values created/set by users in the UI (`InvoiceFormEntity`), AS WELL AS
   * - generated values in the service layer (`InvoiceServiceEntity`).
   * @param input - Invoice creation data as InvoiceServiceEntity
   * @returns Promise resolving to created InvoiceDto returning to Service layer.
   * @throws ValidationError_New for invalid input
   * @throws DatabaseError_New for database failures
   * @throws
   * - Error bubbles up through the Service Layer to the Actions layer.
   */
  async create(input: InvoiceServiceEntity): Promise<InvoiceDto> {
    if (!input || typeof input !== "object") {
      throw new ValidationError_New(INVOICE_ERROR_MESSAGES.VALIDATION_FAILED);
    }

    const createdEntity = await createInvoiceDal(this.db, input);

    return entityToInvoiceDto(createdEntity);
  }

  /**
   * "Safe" read: returns Result instead of throwing.
   */
  async readSafe(
    id: InvoiceId,
  ): Promise<Result<InvoiceDto, ValidationError_New | DatabaseError_New>> {
    if (!id) {
      return Err(
        new ValidationError_New(INVOICE_ERROR_MESSAGES.INVALID_ID, { id }),
      );
    }

    const entityRes = (await fromPromise(
      readInvoiceDal(this.db, id),
    )) as Result<InvoiceEntity, ValidationError_New | DatabaseError_New>;
    if (!entityRes.success) return entityRes;

    return Ok(entityToInvoiceDto(entityRes.data));
  }

  /**
   * Reads an invoice by ID.
   * @param id - InvoiceId (branded type)
   * @returns Promise resolving to InvoiceDto
   * @throws ValidationError_New for invalid parameter id
   * @throws DatabaseError_New for database failures
   */
  async read(id: InvoiceId): Promise<InvoiceDto> {
    // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
    if (!id) {
      throw new ValidationError_New(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    // Call DAL with branded ID
    const entity = await readInvoiceDal(this.db, id);

    // Transform Entity (branded) → DTO (plain)
    return entityToInvoiceDto(entity);
  }

  /**
   * "Safe" update: returns Result instead of throwing.
   */
  async updateSafe(
    id: InvoiceId,
    data: InvoiceFormPartialEntity,
  ): Promise<Result<InvoiceDto, ValidationError_New | DatabaseError_New>> {
    if (!data || !id || typeof data !== "object") {
      return Err(
        new ValidationError_New(INVOICE_ERROR_MESSAGES.VALIDATION_FAILED),
      );
    }

    const updatedEntityRes = (await fromPromise(
      updateInvoiceDal(this.db, id, data),
    )) as Result<InvoiceEntity, ValidationError_New | DatabaseError_New>;

    if (!updatedEntityRes.success) return updatedEntityRes;

    return Ok(entityToInvoiceDto(updatedEntityRes.data));
  }

  /**
   * Updates an invoice.
   * @param id - InvoiceId (branded type)
   * @param data - Update data as InvoiceFormPartialEntity
   * @returns Promise resolving to updated InvoiceDto
   * @throws ValidationError_New for invalid input
   * @throws DatabaseError_New for database failures
   */
  async update(
    id: InvoiceId,
    data: InvoiceFormPartialEntity,
  ): Promise<InvoiceDto> {
    // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
    if (!data || !id || typeof data !== "object") {
      throw new ValidationError_New(INVOICE_ERROR_MESSAGES.VALIDATION_FAILED);
    }

    // Call DAL with branded types
    const updatedEntity = await updateInvoiceDal(this.db, id, data);

    // Transform Entity (branded) → DTO (plain)
    return entityToInvoiceDto(updatedEntity);
  }

  /**
   * "Safe" delete: returns Result instead of throwing.
   */
  async deleteSafe(
    id: InvoiceId,
  ): Promise<Result<InvoiceDto, ValidationError_New | DatabaseError_New>> {
    if (!id) {
      return Err(
        new ValidationError_New(INVOICE_ERROR_MESSAGES.INVALID_ID, { id }),
      );
    }

    const deletedEntityRes = (await fromPromise(
      deleteInvoiceDal(this.db, id),
    )) as Result<InvoiceEntity, ValidationError_New | DatabaseError_New>;

    if (!deletedEntityRes.success) return deletedEntityRes;

    return Ok(entityToInvoiceDto(deletedEntityRes.data));
  }

  /**
   * Deletes an invoice.
   * @param id - InvoiceId (branded type)
   * @returns Promise resolving to deleted InvoiceDto
   * @throws ValidationError_New for invalid ID
   * @throws DatabaseError_New for database failures
   */
  async delete(id: InvoiceId): Promise<InvoiceDto> {
    // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
    if (!id) {
      throw new ValidationError_New(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    // Call DAL with branded ID
    const deletedEntity = await deleteInvoiceDal(this.db, id);

    // Transform Entity (branded) → DTO (plain)
    return entityToInvoiceDto(deletedEntity);
  }

  /**
   * "Safe" findById: returns Result instead of throwing.
   */
  async findByIdSafe(
    id: InvoiceId,
  ): Promise<Result<InvoiceEntity, ValidationError_New | DatabaseError_New>> {
    if (!id) {
      return Err(
        new ValidationError_New(INVOICE_ERROR_MESSAGES.INVALID_ID, { id }),
      );
    }
    return (await fromPromise(readInvoiceDal(this.db, id))) as Result<
      InvoiceEntity,
      ValidationError_New | DatabaseError_New
    >;
  }

  /**
   * Finds an invoice by ID.
   * @param id - InvoiceId (branded type)
   * @returns Promise resolving to InvoiceEntity
   * @throws ValidationError_New for invalid parameter id
   * @throws DatabaseError_New for database failures
   */
  async findById(id: InvoiceId): Promise<InvoiceEntity> {
    if (!id) {
      throw new ValidationError_New(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }
    const entity: InvoiceEntity = await readInvoiceDal(this.db, id);

    return entity;
  }

  /**
   * "Safe" findAll: returns Result instead of throwing.
   */
  async findAllSafe(): Promise<
    Result<InvoiceEntity[], ValidationError_New | DatabaseError_New>
  > {
    const res = (await fromPromise(fetchAllPaidInvoicesDal(this.db))) as Result<
      InvoiceEntity[],
      ValidationError_New | DatabaseError_New
    >;
    if (!res.success) return res;

    return Ok(res.data);
  }

  /**
   * Finds all invoices.
   * @returns Promise resolving to array of InvoiceEntity
   * @throws DatabaseError_New for database failures
   */
  async findAll(): Promise<InvoiceEntity[]> {
    const invoices: InvoiceEntity[] = await fetchAllPaidInvoicesDal(this.db);

    return invoices;
  }
}
