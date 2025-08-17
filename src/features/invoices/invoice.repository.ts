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
import { Err, map, Ok, type Result } from "@/lib/core/result";
import {
  type DatabaseError_New,
  ValidationError_New,
} from "@/lib/errors/error.domain";
import type { RepoError } from "@/lib/errors/error.mapper";
import { fromDal } from "@/lib/errors/error.wrapper";
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
   * Creates a safe invoice entity by validating the input and interacting with the database.
   *
   * @param {InvoiceServiceEntity} input - The invoice service entity containing the invoice details to be validated and saved.
   * @return {Promise<Result<InvoiceDto, ValidationError_New | DatabaseError_New>>} A promise that resolves to a Result object. On success, it contains the InvoiceDto. On error, it contains either a ValidationError_New or DatabaseError_New.
   */
  async createSafe(
    input: InvoiceServiceEntity,
  ): Promise<Result<InvoiceDto, ValidationError_New | DatabaseError_New>> {
    if (!input || typeof input !== "object") {
      return Err(
        new ValidationError_New(INVOICE_ERROR_MESSAGES.VALIDATION_FAILED),
      );
    }

    const createdEntityRes = await fromDal(createInvoiceDal(this.db, input));

    return map<InvoiceEntity, InvoiceDto, RepoError>(entityToInvoiceDto)(
      createdEntityRes,
    );
  }

  /**
   * Repo method to create an invoice.
   * - Accepts values created/set by users in the UI (`InvoiceFormEntity`), AS WELL AS
   * - generated values in the service layer (`InvoiceServiceEntity`).
   * @param input - Invoice creation data as InvoiceServiceEntity
   * @returns Promise resolving to created InvoiceDto returning to Service layer.
   * @throws ValidationError_New for invalid input
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
   * Safely reads an invoice based on the provided ID, ensuring validation
   * checks and correct error handling during the process.
   *
   * @param {InvoiceId} id - The unique identifier of the invoice to be read.
   * @return {Promise<Result<InvoiceDto, ValidationError_New | DatabaseError_New>>}
   *         A result object containing either the successfully retrieved invoice
   *         data or an error (validation or database-related).
   */
  async readSafe(
    id: InvoiceId,
  ): Promise<Result<InvoiceDto, ValidationError_New | DatabaseError_New>> {
    if (!id) {
      return Err(
        new ValidationError_New(INVOICE_ERROR_MESSAGES.INVALID_ID, { id }),
      );
    }

    const entityRes = await fromDal(readInvoiceDal(this.db, id));

    return map<InvoiceEntity, InvoiceDto, RepoError>(entityToInvoiceDto)(
      entityRes,
    );
  }

  /**
   * Reads an invoice by ID.
   * @param id - InvoiceId (branded type)
   * @returns Promise resolving to InvoiceDto
   * @throws ValidationError_New for invalid parameter id
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
   * Updates an existing invoice safely in the data store with the provided data.
   *
   * @param id The unique identifier of the invoice to be updated.
   * @param data The partial entity containing the fields to be updated for the invoice.
   * @return A promise that resolves to a `Result` containing either the updated `InvoiceDto` on success
   *         or a `ValidationError_New` or `DatabaseError_New` on failure.
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

    const updatedEntityRes = await fromDal(updateInvoiceDal(this.db, id, data));

    return map<InvoiceEntity, InvoiceDto, RepoError>(entityToInvoiceDto)(
      updatedEntityRes,
    );
  }

  /**
   * Updates an invoice.
   * @param id - InvoiceId (branded type)
   * @param data - Update data as InvoiceFormPartialEntity
   * @returns Promise resolving to updated InvoiceDto
   * @throws ValidationError_New for invalid input
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
   * Deletes an invoice safely by its ID. Validates the input ID and ensures the proper handling of errors during the deletion process.
   *
   * @param id The unique identifier of the invoice to be deleted.
   * @return A `Result` object containing either the deleted invoice data as `InvoiceDto` upon success, or a validation or database error if the operation fails.
   */
  async deleteSafe(
    id: InvoiceId,
  ): Promise<Result<InvoiceDto, ValidationError_New | DatabaseError_New>> {
    if (!id) {
      return Err(
        new ValidationError_New(INVOICE_ERROR_MESSAGES.INVALID_ID, { id }),
      );
    }

    const deletedEntityRes = await fromDal(deleteInvoiceDal(this.db, id));
    return map<InvoiceEntity, InvoiceDto, RepoError>(entityToInvoiceDto)(
      deletedEntityRes,
    );
  }

  /**
   * Deletes an invoice.
   * @param id - InvoiceId (branded type)
   * @returns Promise resolving to deleted InvoiceDto
   * @throws ValidationError_New for invalid ID
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
    return await fromDal(readInvoiceDal(this.db, id));
  }

  /**
   * Finds an invoice by ID.
   * @param id - InvoiceId (branded type)
   * @returns Promise resolving to InvoiceEntity
   * @throws ValidationError_New for invalid parameter id
   */
  async findById(id: InvoiceId): Promise<InvoiceEntity> {
    if (!id) {
      throw new ValidationError_New(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }
    return await readInvoiceDal(this.db, id);
  }

  /**
   * "Safe" findAll: returns Result instead of throwing.
   */
  async findAllSafe(): Promise<
    Result<InvoiceEntity[], ValidationError_New | DatabaseError_New>
  > {
    const res = await fromDal(fetchAllPaidInvoicesDal(this.db));

    if (!res.success) return res;

    return Ok(res.data);
  }

  /**
   * Finds all invoices.
   * @returns Promise resolving to array of InvoiceEntity
   */
  async findAll(): Promise<InvoiceEntity[]> {
    return await fetchAllPaidInvoicesDal(this.db);
  }
}
