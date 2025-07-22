import "server-only";

import type { InvoiceFormEntity } from "@/db/models/invoice.entity";
import { ValidationError } from "@/errors/errors";
import { toInvoiceId } from "@/features/invoices/invoice.brands";
import type {
  InvoiceDto,
  InvoiceFormDto,
} from "@/features/invoices/invoice.dto";
import {
  dtoToCreateInvoiceEntity,
  partialDtoToCreateInvoiceEntity,
} from "@/features/invoices/invoice.mapper";
import type { InvoiceRepository } from "@/features/invoices/invoice.repository";
import type { InvoiceListFilter } from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";

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
   * Creates an invoice from validated DTO.
   * @param dto - Validated InvoiceFormDto
   * @returns Promise resolving to created InvoiceDto
   * @throws ValidationError for invalid input
   */
  async createInvoice(dto: InvoiceFormDto): Promise<InvoiceDto> {
    // Basic validation of input. Throw error to Actions layer.
    if (!dto) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_INPUT);
    }

    // Business transformation:
    const createDto: InvoiceFormDto = {
      amount: this.dollarsTocents(dto.amount),
      customerId: dto.customerId,
      date: this.validateAndFormatDate(dto.date),
      sensitiveData: dto.sensitiveData,
      status: dto.status,
    };

    // Transform DTO (plain) → Entity (branded)
    const entity: InvoiceFormEntity = dtoToCreateInvoiceEntity(createDto);

    // Call repository to create invoice
    return await this.repo.create(entity);
  }

  /**
   * Reads an invoice by ID.
   * @param id - Invoice ID as string
   * @returns Promise resolving to InvoiceDto
   * @throws ValidationError for invalid ID
   */
  async readInvoice(id: string): Promise<InvoiceDto> {
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

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

    // What is this solution called?
    const updateDto: Partial<InvoiceFormDto> = {
      ...(dto.amount !== undefined && {
        amount: this.dollarsTocents(dto.amount),
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
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    return await this.repo.delete(toInvoiceId(id));
  }

  /**
   * Lists invoices with pagination and filtering.
   * @param filter - Filtering options
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Promise with invoice data and total count
   */
  async listInvoices(
    filter: InvoiceListFilter,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ data: InvoiceDto[]; total: number }> {
    // Business rules can be added here (e.g., filter sanitization)
    return await this.repo.list(filter, page, pageSize);
  }

  /**
   * Business rule: Convert dollars to cents
   */
  private dollarsTocents(dollars: number): number {
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
}
