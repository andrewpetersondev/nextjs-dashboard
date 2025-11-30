import "server-only";
import type { InvoiceDto, InvoiceFormDto } from "@/features/invoices/lib/dto";
import {
  dtoToCreateInvoiceEntity,
  partialDtoToCreateInvoiceEntity,
} from "@/server/invoices/invoice-codecs.server";
import { invoiceFormEntityToServiceEntity } from "@/server/invoices/mapper";
import type { InvoiceRepository } from "@/server/invoices/repo";
import { toInvoiceId } from "@/shared/branding/id-converters";
import { AppError } from "@/shared/errors/core/app-error.class";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";
import { CENTS_IN_DOLLAR } from "@/shared/money/types";

/**
 * Service for invoice business logic and transformation.
 * Receives validated DTOs only.
 * Sends out branded entities and DTOs.
 */
export class InvoiceService {
  private readonly repo: InvoiceRepository;

  /**
   * @param repo - InvoiceRepository instance (injected)
   */
  constructor(repo: InvoiceRepository) {
    this.repo = repo;
  }

  /**
   * Business rule: Convert dollars to cents
   */
  private dollarsToCents(dollars: number): number {
    return Math.round(dollars * CENTS_IN_DOLLAR);
  }

  /**
   * Business rule: Validate and format date
   */
  private validateAndFormatDate(date: string): string {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      // Use a known message ID so upper layers can translate consistently
      throw new AppError("validation", {
        message: INVOICE_MSG.invalidFormData,
        metadata: { date },
      });
    }
    return date; // Already in ISO format from form
  }

  /**
   * Applies business rules to invoice creation data.
   * @param dto - Raw InvoiceFormDto
   * @returns Transformed InvoiceFormDto with business rules applied
   *
   * @remarks
   * - Converts amount from dollars to cents
   * - Validates and formats date to ISO string
   */
  private applyBusinessRules(dto: InvoiceFormDto): InvoiceFormDto {
    return {
      amount: this.dollarsToCents(dto.amount),
      customerId: dto.customerId,
      date: this.validateAndFormatDate(dto.date),
      sensitiveData: dto.sensitiveData,
      status: dto.status,
    };
  }

  /**
   * Creates an invoice from validated DTO.
   * @param dto - Validated InvoiceFormDto
   * @returns Promise resolving to created InvoiceDto
   * @throws AppError (code: "validation") with an InvoiceMessageId for invalid input
   */
  async createInvoice(dto: InvoiceFormDto): Promise<InvoiceDto> {
    if (!dto) {
      throw new AppError("validation", {
        message: INVOICE_MSG.invalidInput,
      });
    }

    const transformedDto = this.applyBusinessRules(dto);

    const formEntity = dtoToCreateInvoiceEntity(transformedDto);
    const serviceEntity = invoiceFormEntityToServiceEntity(formEntity);

    return await this.repo.create(serviceEntity);
  }

  /**
   * Reads an invoice by ID.
   * @param id - Invoice ID as string
   * @returns Promise resolving to InvoiceDto
   * @throws AppError (code: "validation") with an InvoiceMessageId for invalid ID
   */
  async readInvoice(id: string): Promise<InvoiceDto> {
    // Basic validation of input. Throw error to Actions layer.
    if (!id) {
      throw new AppError("validation", {
        message: INVOICE_MSG.invalidId,
        metadata: { id },
      });
    }

    // Transform plain string → branded ID and call repository
    return await this.repo.read(toInvoiceId(id));
  }

  /**
   * Updates an invoice from validated partial DTO.
   * @param id - Invoice ID as string
   * @param dto - Partial validated InvoiceFormDto
   * @returns Promise resolving to updated InvoiceDto
   * @throws AppError (code: "validation") with an InvoiceMessageId for invalid input
   */
  async updateInvoice(
    id: string,
    dto: Partial<InvoiceFormDto>,
  ): Promise<InvoiceDto> {
    // Basic validation of input. Throw error to Actions layer.
    if (!(id && dto)) {
      throw new AppError("validation", {
        message: INVOICE_MSG.invalidInput,
        metadata: { hasDto: Boolean(dto), id },
      });
    }

    // Object Spread Immutability
    const updateDto: Partial<InvoiceFormDto> = {
      ...(dto.amount !== undefined && {
        amount: this.dollarsToCents(dto.amount),
      }),
      ...(dto.customerId !== undefined && { customerId: dto.customerId }),
      ...(dto.date !== undefined && {
        date: this.validateAndFormatDate(dto.date),
      }),
      ...(dto.sensitiveData !== undefined && {
        sensitiveData: dto.sensitiveData,
      }),
      ...(dto.status !== undefined && { status: dto.status }),
    };

    const entity = partialDtoToCreateInvoiceEntity(updateDto);

    return await this.repo.update(toInvoiceId(id), entity);
  }

  /**
   * Deletes an invoice by ID.
   * @param id - Invoice ID as string
   * @returns Promise resolving to deleted InvoiceDto
   * @throws AppError (code: "validation") with an InvoiceMessageId for invalid ID
   */
  async deleteInvoice(id: string): Promise<InvoiceDto> {
    // Basic validation of parameters. Throw error to Actions layer.
    if (!id) {
      throw new AppError("validation", {
        message: INVOICE_MSG.invalidId,
        metadata: { id },
      });
    }

    // Call repo with branded ID and return Dto to Actions layer
    return await this.repo.delete(toInvoiceId(id));
  }
}
