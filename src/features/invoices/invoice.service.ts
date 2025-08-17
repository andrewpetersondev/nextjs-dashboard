import "server-only";

import type {
  InvoiceDto,
  InvoiceFormDto,
} from "@/features/invoices/invoice.dto";
import {
  dtoToCreateInvoiceEntity,
  invoiceFormEntityToServiceEntity,
  partialDtoToCreateInvoiceEntity,
} from "@/features/invoices/invoice.mapper";
import type { InvoiceRepository } from "@/features/invoices/invoice.repository";
import { toInvoiceId } from "@/lib/core/brands";
import { INVOICE_ERROR_MESSAGES } from "@/lib/errors/error-messages";
import { ValidationError } from "@/lib/errors/errors";

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
    return Math.round(dollars * 100);
  }

  /**
   * Business rule: Validate and format date
   */
  private validateAndFormatDate(date: string): string {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      throw new ValidationError("Invalid date format");
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
   *
   * @Business-Layer-Concepts:
   * - Separates business logic from technical validation and entity conversions. Am I right?
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
   * @throws ValidationError for invalid input to the Actions layer
   * @throws
   * - Error bubbles up through the repository layer to the Actions layer.
   */
  async createInvoice(dto: InvoiceFormDto): Promise<InvoiceDto> {
    if (!dto) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_INPUT);
    }

    const transformedDto = this.applyBusinessRules(dto);

    const formEntity = dtoToCreateInvoiceEntity(transformedDto);
    const serviceEntity = invoiceFormEntityToServiceEntity(formEntity);

    const responseDTO = await this.repo.create(serviceEntity);

    return responseDTO;
  }

  /**
   * Reads an invoice by ID.
   * @param id - Invoice ID as string
   * @returns Promise resolving to InvoiceDto
   * @throws ValidationError for invalid ID
   */
  async readInvoice(id: string): Promise<InvoiceDto> {
    // Basic validation of input. Throw error to Actions layer.
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    // Transform plain string → branded ID and call repository
    return await this.repo.read(toInvoiceId(id));
  }

  /**
   * Updates an invoice from validated partial DTO.
   * @param id - Invoice ID as string
   * @param dto - Partial validated InvoiceFormDto
   * @returns Promise resolving to updated InvoiceDto
   * @throws ValidationError for invalid input
   */
  async updateInvoice(
    id: string,
    dto: Partial<InvoiceFormDto>,
  ): Promise<InvoiceDto> {
    // Basic validation of input. Throw error to Actions layer.
    if (!id || !dto) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_INPUT);
    }

    // What is this solution called? Object Spread Immutability.
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
   * @throws ValidationError for invalid ID
   */
  async deleteInvoice(id: string): Promise<InvoiceDto> {
    // Basic validation of parameters. Throw error to Actions layer.
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    // Call repo with branded ID and return Dto to Actions layer
    return await this.repo.delete(toInvoiceId(id));
  }
}
