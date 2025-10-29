import "server-only";

import type { InvoiceDto } from "@/features/invoices/lib/dto";
import type { DatabaseError } from "@/server/errors/infrastructure-errors";
import { createInvoiceDal } from "@/server/invoices/dal/create";
import { deleteInvoiceDal } from "@/server/invoices/dal/delete";
import { fetchAllPaidInvoicesDal } from "@/server/invoices/dal/fetch-all-paid";
import { readInvoiceDal } from "@/server/invoices/dal/read";
import { updateInvoiceDal } from "@/server/invoices/dal/update";
import type {
  InvoiceEntity,
  InvoiceFormPartialEntity,
  InvoiceServiceEntity,
} from "@/server/invoices/entity";
import type { RepoError } from "@/server/invoices/error-mappers.server";
import { promiseToRepoResult } from "@/server/invoices/error-wrappers.result";
import { entityToInvoiceDto } from "@/server/invoices/invoice-codecs.server";
import { BaseRepository } from "@/server/repository/base-repository";
import { ValidationError } from "@/shared/core/errors/domain/domain-errors";
import { Err, Ok, type Result } from "@/shared/core/result/result";
import { mapOk } from "@/shared/core/result/sync/result-map";
import type { InvoiceId } from "@/shared/domain/domain-brands";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";

/**
 * Repository for managing invoice data.
 *
 * Provides methods to safely create, read, update, and delete invoices,
 * with validation and database interaction utilities to standardize behavior.
 *
 * @typeParam TDto - The DTO type returned to the service layer.
 * @typeParam TId - The branded ID type used for invoices.
 * @typeParam TCreateInput - Input type for creating an invoice.
 * @typeParam TUpdateInput - Input type for updating an invoice.
 */
export class InvoiceRepository extends BaseRepository<
  InvoiceDto,
  InvoiceId,
  InvoiceServiceEntity,
  InvoiceFormPartialEntity
> {
  /**
   * Creates a safe invoice entity by validating the input and interacting with the database.
   *
   * @param {InvoiceServiceEntity} input - The invoice service entity containing the invoice details to be validated and saved.
   * @return {Promise<Result<InvoiceDto, ValidationError | DatabaseError>>} A promise that resolves to a Result object. On success, it contains the InvoiceDto. On error, it contains either a ValidationError_New or DatabaseError_New.
   */
  async createSafe(
    input: InvoiceServiceEntity,
  ): Promise<Result<InvoiceDto, ValidationError | DatabaseError>> {
    if (!input || typeof input !== "object") {
      return Err(new ValidationError(INVOICE_MSG.invalidInput));
    }

    const createdEntityRes = await promiseToRepoResult(
      createInvoiceDal(this.db, input),
    );

    return mapOk<InvoiceEntity, InvoiceDto, RepoError>(entityToInvoiceDto)(
      createdEntityRes,
    );
  }

  /**
   * Repo method to create an invoice.
   * - Accepts values created/set by users in the UI (`InvoiceFormEntity`), AS WELL AS
   * - generated values in the service layer (`InvoiceServiceEntity`).
   * @param input - Invoice creation data as InvoiceServiceEntity
   * @returns Promise resolving to created InvoiceDto returning to Service layer.
   * @throws ValidationError for invalid input
   * @throws
   * - Error bubbles up through the Service Layer to the Actions layer.
   */
  async create(input: InvoiceServiceEntity): Promise<InvoiceDto> {
    if (!input || typeof input !== "object") {
      throw new ValidationError(INVOICE_MSG.invalidInput);
    }

    const createdEntity = await createInvoiceDal(this.db, input);

    return entityToInvoiceDto(createdEntity);
  }

  /**
   * Safely reads an invoice based on the provided ID, ensuring validation
   * checks and correct error handling during the process.
   *
   * @param {InvoiceId} id - The unique identifier of the invoice to be read.
   * @return {Promise<Result<InvoiceDto, ValidationError | DatabaseError>>}
   *         A result object containing either the successfully retrieved invoice
   *         data or an error (validation or database-related).
   */
  async readSafe(
    id: InvoiceId,
  ): Promise<Result<InvoiceDto, ValidationError | DatabaseError>> {
    if (!id) {
      return Err(new ValidationError(INVOICE_MSG.invalidId, { id }));
    }

    const entityRes = await promiseToRepoResult(readInvoiceDal(this.db, id));

    return mapOk<InvoiceEntity, InvoiceDto, RepoError>(entityToInvoiceDto)(
      entityRes,
    );
  }

  /**
   * Reads an invoice by ID.
   * @param id - InvoiceId (branded type)
   * @returns Promise resolving to InvoiceDto
   * @throws ValidationError for invalid parameter id
   */
  async read(id: InvoiceId): Promise<InvoiceDto> {
    // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
    if (!id) {
      throw new ValidationError(INVOICE_MSG.invalidId, { id });
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
  ): Promise<Result<InvoiceDto, ValidationError | DatabaseError>> {
    if (!id) {
      return Err(new ValidationError(INVOICE_MSG.invalidId, { id }));
    }
    if (!data || typeof data !== "object") {
      return Err(new ValidationError(INVOICE_MSG.invalidInput));
    }

    const updatedEntityRes = await promiseToRepoResult(
      updateInvoiceDal(this.db, id, data),
    );

    return mapOk<InvoiceEntity, InvoiceDto, RepoError>(entityToInvoiceDto)(
      updatedEntityRes,
    );
  }

  /**
   * Updates an invoice.
   * @param id - InvoiceId (branded type)
   * @param data - Update data as InvoiceFormPartialEntity
   * @returns Promise resolving to updated InvoiceDto
   * @throws ValidationError for invalid input
   */
  async update(
    id: InvoiceId,
    data: InvoiceFormPartialEntity,
  ): Promise<InvoiceDto> {
    if (!id) {
      throw new ValidationError(INVOICE_MSG.invalidId, { id });
    }
    if (!data || typeof data !== "object") {
      throw new ValidationError(INVOICE_MSG.invalidInput);
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
  ): Promise<Result<InvoiceDto, ValidationError | DatabaseError>> {
    if (!id) {
      return Err(new ValidationError(INVOICE_MSG.invalidId, { id }));
    }

    const deletedEntityRes = await promiseToRepoResult(
      deleteInvoiceDal(this.db, id),
    );
    return mapOk<InvoiceEntity, InvoiceDto, RepoError>(entityToInvoiceDto)(
      deletedEntityRes,
    );
  }

  /**
   * Deletes an invoice.
   * @param id - InvoiceId (branded type)
   * @returns Promise resolving to deleted InvoiceDto
   * @throws ValidationError for invalid ID
   */
  async delete(id: InvoiceId): Promise<InvoiceDto> {
    // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
    if (!id) {
      throw new ValidationError(INVOICE_MSG.invalidId, { id });
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
  ): Promise<Result<InvoiceEntity, ValidationError | DatabaseError>> {
    if (!id) {
      return Err(new ValidationError(INVOICE_MSG.invalidId, { id }));
    }
    return await promiseToRepoResult(readInvoiceDal(this.db, id));
  }

  /**
   * Finds an invoice by ID.
   * @param id - InvoiceId (branded type)
   * @returns Promise resolving to InvoiceEntity
   * @throws ValidationError for invalid parameter id
   */
  async findById(id: InvoiceId): Promise<InvoiceEntity> {
    if (!id) {
      throw new ValidationError(INVOICE_MSG.invalidId, { id });
    }
    return await readInvoiceDal(this.db, id);
  }

  /**
   * "Safe" findAll: returns Result instead of throwing.
   */
  async findAllSafe(): Promise<
    Result<InvoiceEntity[], ValidationError | DatabaseError>
  > {
    const res = await promiseToRepoResult(fetchAllPaidInvoicesDal(this.db));

    if (!res.ok) {
      return res;
    }

    return Ok(res.value);
  }

  /**
   * Finds all invoices.
   * @returns Promise resolving to array of InvoiceEntity
   */
  async findAll(): Promise<InvoiceEntity[]> {
    return await fetchAllPaidInvoicesDal(this.db);
  }
}
