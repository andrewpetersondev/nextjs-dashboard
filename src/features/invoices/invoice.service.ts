import "server-only";

import { DatabaseError } from "@/errors/database-error";
import { ValidationError } from "@/errors/validation-error";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { InvoiceRepository } from "@/features/invoices/invoice.repository";
import { CreateInvoiceSchema } from "@/features/invoices/invoice.schemas";
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
 * - Handles error messages.
 * - Accepts a logger for testability.
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

  async createInvoiceService(formData: FormData): Promise<InvoiceDto> {
    if (!formData) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_INPUT, {
        formData,
      });
    }

    const validated = CreateInvoiceSchema.safeParse({
      amount: formData.get("amount"),
      customerId: formData.get("customerId"),
      sensitiveData: formData.get("sensitiveData"),
      status: formData.get("status"),
    });

    if (!validated.success) {
      throw new ValidationError(
        "Validation failed for invoice creation",
        validated.error,
      );
    }

    const dalInput: InvoiceCreateInput = {
      amount: Math.round(validated.data.amount * 100),
      customerId: toCustomerId(validated.data.customerId),
      date: getCurrentIsoDate(),
      sensitiveData: validated.data.sensitiveData as string,
      status: toInvoiceStatusBrand(validated.data.status),
    };
    try {
      return await this.repo.create(dalInput);
    } catch (error) {
      this.handleError("createInvoiceService", error);
    }
  }

  async readInvoiceService(id: string): Promise<InvoiceDto> {
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }
    try {
      const invoiceId = toInvoiceId(id);
      return await this.repo.read(invoiceId);
    } catch (error) {
      this.handleError("readInvoiceService", error);
    }
  }

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

    const validated = CreateInvoiceSchema.safeParse({
      amount: formData.get("amount"),
      customerId: formData.get("customerId"),
      date: formData.get("date"),
      sensitiveData: formData.get("sensitiveData"),
      status: formData.get("status"),
    });

    if (!validated.success) {
      throw new ValidationError(
        "Validation failed for invoice update",
        validated.error,
      );
    }

    try {
      return await this.repo.update(toInvoiceId(id), {
        amount: Math.round(validated.data.amount * 100),
        customerId: toCustomerId(validated.data.customerId),
        date: validated.data.date || getCurrentIsoDate(),
        id: toInvoiceId(id),
        sensitiveData: validated.data.sensitiveData as string,
        status: toInvoiceStatusBrand(validated.data.status),
      });
    } catch (error) {
      this.handleError("updateInvoiceService", error);
    }
  }

  async deleteInvoiceService(id: string): Promise<InvoiceDto> {
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }
    try {
      const invoiceId = toInvoiceId(id);
      return await this.repo.delete(invoiceId);
    } catch (error) {
      this.handleError("deleteInvoiceService", error);
    }
  }

  private handleError(context: string, error: unknown): never {
    if (error instanceof ValidationError) {
      this.logger.warn({ context, error });
      throw error;
    }
    if (error instanceof DatabaseError) {
      this.logger.error({ context, error });
      throw error;
    }
    this.logger.error({
      context,
      error,
      message: INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
    });
    throw new Error(INVOICE_ERROR_MESSAGES.SERVICE_ERROR);
  }
}
