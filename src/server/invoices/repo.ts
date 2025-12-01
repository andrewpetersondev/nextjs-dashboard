import "server-only";
import type { InvoiceDto } from "@/features/invoices/lib/dto";
import { createInvoiceDal } from "@/server/invoices/dal/create";
import { deleteInvoiceDal } from "@/server/invoices/dal/delete";
import { readInvoiceDal } from "@/server/invoices/dal/read";
import { updateInvoiceDal } from "@/server/invoices/dal/update";
import type {
  InvoiceFormPartialEntity,
  InvoiceServiceEntity,
} from "@/server/invoices/entity";
import { entityToInvoiceDto } from "@/server/invoices/invoice-codecs.server";
import { BaseRepository } from "@/server/repository/base-repository";
import type { InvoiceId } from "@/shared/branding/domain-brands";
import { AppError } from "@/shared/errors/core/app-error.class";
import { INVOICE_MSG } from "@/shared/i18n/invoice-messages";

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
   * Repo method to create an invoice.
   * - Accepts values created/set by users in the UI (`InvoiceFormEntity`), AS WELL AS
   * - generated values in the service layer (`InvoiceServiceEntity`).
   * @param input - Invoice creation data as InvoiceServiceEntity
   * @returns Promise resolving to created InvoiceDto returning to Service layer.
   * @throws AppError (code: "validation") for invalid input
   * @throws
   * - Error bubbles up through the Service Layer to the Actions layer.
   */
  async create(input: InvoiceServiceEntity): Promise<InvoiceDto> {
    if (!input || typeof input !== "object") {
      throw new AppError("validation", {
        message: INVOICE_MSG.invalidInput,
      });
    }

    const createdEntity = await createInvoiceDal(this.db, input);

    return entityToInvoiceDto(createdEntity);
  }

  /**
   * Reads an invoice by ID.
   * @param id - InvoiceId (branded type)
   * @returns Promise resolving to InvoiceDto
   * @throws AppError (code: "validation") for invalid parameter id
   */
  async read(id: InvoiceId): Promise<InvoiceDto> {
    // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
    if (!id) {
      throw new AppError("validation", {
        message: INVOICE_MSG.invalidId,
        metadata: { id },
      });
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
   * @throws AppError (code: "validation") for invalid input
   */
  async update(
    id: InvoiceId,
    data: InvoiceFormPartialEntity,
  ): Promise<InvoiceDto> {
    if (!id) {
      throw new AppError("validation", {
        message: INVOICE_MSG.invalidId,
        metadata: { id },
      });
    }
    if (!data || typeof data !== "object") {
      throw new AppError("validation", {
        message: INVOICE_MSG.invalidInput,
      });
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
   * @throws AppError (code: "validation") for invalid ID
   */
  async delete(id: InvoiceId): Promise<InvoiceDto> {
    // Basic parameter validation. Throw error. Error bubbles up through Service Layer to Actions layer.
    if (!id) {
      throw new AppError("validation", {
        message: INVOICE_MSG.invalidId,
        metadata: { id },
      });
    }

    // Call DAL with branded ID
    const deletedEntity = await deleteInvoiceDal(this.db, id);

    // Transform Entity (branded) → DTO (plain)
    return entityToInvoiceDto(deletedEntity);
  }
}
