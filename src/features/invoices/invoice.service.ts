import "server-only";

import { ValidationError } from "@/errors/errors";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { InvoiceRepository } from "@/features/invoices/invoice.repository";
import type { InvoiceCreateInput } from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import {
  toCustomerId,
  toInvoiceId,
  toInvoiceStatusBrand,
} from "@/lib/definitions/brands";
import { logger as defaultLogger } from "@/lib/utils/logger";
import { getCurrentIsoDate } from "@/lib/utils/utils";

/**
 * Service for invoice business logic and validation.
 * @remarks
 * - Service should handle business logic, not duplicate validation.
 * - Handles error messages.
 * - Accepts a logger for testability.
 */
export class InvoiceService {
  private readonly repo: InvoiceRepository;
  // private readonly logger: typeof defaultLogger;

  constructor(
    repo: InvoiceRepository,
    logger: typeof defaultLogger = defaultLogger,
  ) {
    this.repo = repo;
    this.logger = logger;
  }

  /**
   * Creates an invoice from form data.
   * Handles business logic transformation only.
   */
  async createInvoiceService(formData: FormData): Promise<InvoiceDto> {
    if (!formData) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_INPUT);
    }

    // Transform FormData to Repository input
    const dalInput: InvoiceCreateInput = {
      amount: Math.round(Number(formData.get("amount")) * 100),
      customerId: toCustomerId(String(formData.get("customerId"))),
      date: getCurrentIsoDate(),
      sensitiveData: String(formData.get("sensitiveData")),
      status: toInvoiceStatusBrand(String(formData.get("status"))),
    };

    // Let Repository handle validation and database operations
    return await this.repo.create(dalInput);
  }

  /**
   * Reads an invoice by ID.
   */
  async readInvoiceService(id: string): Promise<InvoiceDto> {
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    const invoiceId = toInvoiceId(id);
    return await this.repo.read(invoiceId);
  }

  /**
   * Updates an invoice from form data.
   * Handles business logic transformation only.
   */
  async updateInvoiceService(
    id: string,
    formData: FormData,
  ): Promise<InvoiceDto> {
    if (!id || !formData) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_INPUT, {
        formData,
        id,
      });
    }

    // Transform form data to Repository input
    const updateInput: InvoiceUpdateInput = {
      amount: Math.round(Number(formData.get("amount")) * 100),
      customerId: toCustomerId(String(formData.get("customerId"))),
      date: getCurrentIsoDate(),
      id: toInvoiceId(id),
      sensitiveData: String(formData.get("sensitiveData")),
      status: toInvoiceStatusBrand(String(formData.get("status"))),
    };

    // Let Repository handle validation and database operations
    return await this.repo.update(toInvoiceId(id), updateInput);
  }

  /**
   * Deletes an invoice by ID.
   */
  async deleteInvoiceService(id: string): Promise<InvoiceDto> {
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }

    const invoiceId = toInvoiceId(id);

    return await this.repo.delete(invoiceId);
  }
}
