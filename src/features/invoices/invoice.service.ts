import "server-only";

import type { CreateInvoiceEntity } from "@/db/models/invoice.entity";
import { ValidationError } from "@/errors/errors";
import type {
  InvoiceDto,
  InvoiceFormInput,
} from "@/features/invoices/invoice.dto";
import {
  dtoToCreateInvoiceEntity,
  partialDtoToCreateInvoiceEntity,
} from "@/features/invoices/invoice.mapper";
import type { InvoiceRepository } from "@/features/invoices/invoice.repository";
import {
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
} from "@/features/invoices/invoice.schemas";
import type { InvoiceStatus } from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { toInvoiceId } from "@/lib/definitions/brands";
import { logger as defaultLogger } from "@/lib/utils/logger";

/**
 * Service for invoice business logic and transformation.
 * Handles FormData extraction, validation, business rules.
 */
export class InvoiceService {
  private readonly repo: InvoiceRepository;
  private readonly logger: typeof defaultLogger;

  constructor(
    repo: InvoiceRepository,
    logger: typeof defaultLogger = defaultLogger,
  ) {
    this.repo = repo;
    this.logger = logger;
  }

  /**
   * Creates an invoice from form data.
   * @param formData - FormData from client
   * @returns Promise resolving to created InvoiceDto
   * @throws ValidationError for invalid input
   * @remarks
   * Applies business rules: dollars→cents conversion, date validation, branding.
   */
  async createInvoice(formData: FormData): Promise<InvoiceDto> {
    if (!formData) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_INPUT);
    }

    const input: InvoiceFormInput = this.extractFormData(formData);

    const validated = CreateInvoiceSchema.parse(input);

    const createDto = {
      amount: this.dollarsTocents(validated.amount),
      customerId: validated.customerId,
      date: this.validateAndFormatDate(validated.date),
      sensitiveData: validated.sensitiveData,
      status: validated.status,
    };

    const entity: CreateInvoiceEntity = dtoToCreateInvoiceEntity(createDto);

    return await this.repo.create(entity);
  }

  /**
   * Reads an invoice by ID.
   * @param id - Invoice ID as string
   * @returns Promise resolving to InvoiceDto
   * @throws ValidationError for invalid ID
   * @remarks
   * Applies business rules: branding is applied in the repository.
   */
  async readInvoice(id: string): Promise<InvoiceDto> {
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    return await this.repo.read(toInvoiceId(id));
  }

  /**
   * Updates an invoice from form data.
   * @param id - Invoice ID as string
   * @param formData - FormData from client
   * @returns Promise resolving to updated InvoiceDto
   * @throws ValidationError for invalid input
   * @remarks
   * Applies business rules: dollars→cents conversion, date validation, branding.
   */
  async updateInvoice(id: string, formData: FormData): Promise<InvoiceDto> {
    if (!id || !formData) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_INPUT);
    }

    const input: InvoiceFormInput = this.extractFormData(formData);

    const validated = UpdateInvoiceSchema.parse(input);

    const updateDto = {
      id,
      ...(validated.amount !== undefined && {
        amount: this.dollarsTocents(validated.amount),
      }),
      ...(validated.customerId && {
        customerId: validated.customerId,
      }),
      ...(validated.date && {
        date: this.validateAndFormatDate(validated.date),
      }),
      ...(validated.sensitiveData && {
        sensitiveData: validated.sensitiveData,
      }),
      ...(validated.status && { status: validated.status }),
    };

    const entity = partialDtoToCreateInvoiceEntity(updateDto);

    return await this.repo.update(toInvoiceId(id), entity);
  }

  /**
   * Deletes an invoice by ID.
   * @param id - Invoice ID as string
   * @returns Promise resolving to deleted InvoiceDto
   * @throws ValidationError for invalid ID
   * @remarks
   * Applies business rules and branding.
   */
  async deleteInvoice(id: string): Promise<InvoiceDto> {
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    return await this.repo.delete(toInvoiceId(id));
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

  /**
   * Extracts form data for creating/updating invoices.
   * @excludes `id` because it is never in the form
   */
  private extractFormData(formData: FormData): InvoiceFormInput {
    return {
      amount: Number(formData.get("amount")),
      customerId: String(formData.get("customerId")),
      date: String(formData.get("date")),
      sensitiveData: String(formData.get("sensitiveData")),
      status: String(formData.get("status")) as InvoiceStatus,
    };
  }
}
