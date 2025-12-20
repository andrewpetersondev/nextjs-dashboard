import "server-only";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceDto } from "@/modules/invoices/domain/invoice.dto";
import type {
  InvoiceFormPartialEntity,
  InvoiceServiceEntity,
} from "@/modules/invoices/domain/invoice.entity";
import { entityToInvoiceDto } from "@/modules/invoices/server/infrastructure/adapters/codecs/invoice-codecs";
import { BaseRepository } from "@/modules/invoices/server/infrastructure/repository/base-repository";
import { createInvoiceDal } from "@/modules/invoices/server/infrastructure/repository/dal/create-invoice.dal";
import { deleteInvoiceDal } from "@/modules/invoices/server/infrastructure/repository/dal/delete-invoice.dal";
import { readInvoiceDal } from "@/modules/invoices/server/infrastructure/repository/dal/read-invoice.dal";
import { updateInvoiceDal } from "@/modules/invoices/server/infrastructure/repository/dal/update-invoice.dal";
import type { InvoiceId } from "@/shared/branding/brands";
import { AppError } from "@/shared/errors/core/app-error";

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
        cause: "",
        message: INVOICE_MSG.invalidInput,
        metadata: { input },
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
        cause: "",
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
        cause: "",
        message: INVOICE_MSG.invalidId,
        metadata: { id },
      });
    }
    if (!data || typeof data !== "object") {
      throw new AppError("validation", {
        cause: "",
        message: INVOICE_MSG.invalidInput,
        metadata: { data },
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
        cause: "",
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
