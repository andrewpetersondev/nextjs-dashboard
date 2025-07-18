import "server-only";

import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type { InvoiceRepository } from "@/features/invoices/invoice.repository";
import type { InvoiceCreateInput } from "@/features/invoices/invoice.types";
import { CreateInvoiceSchema } from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import {
  toCustomerId,
  toInvoiceId,
  toInvoiceStatusBrand,
} from "@/lib/definitions/brands";

/**
 * Service for invoice business logic and validation.
 */
export class InvoiceService {
  private readonly repo: InvoiceRepository;

  /**
   * @param repo - InvoiceRepository instance (dependency injection)
   */
  constructor(repo: InvoiceRepository) {
    this.repo = repo;
  }

  /**
   * Validates and creates an invoice.
   * @param formData - FormData from the client.
   * @returns The created InvoiceDto.
   * @throws {ZodError | Error} On validation or DB error.
   */
  async createInvoice(formData: FormData): Promise<InvoiceDto> {
    const validated = CreateInvoiceSchema.safeParse({
      amount: formData.get("amount"),
      customerId: formData.get("customerId"),
      status: formData.get("status"),
    });

    if (!validated.success) {
      throw validated.error;
    }

    const dalInput: InvoiceCreateInput = {
      amount: Math.round(validated.data.amount * 100),
      customerId: toCustomerId(validated.data.customerId),
      date: new Date().toISOString(),
      status: toInvoiceStatusBrand(validated.data.status),
    };

    const invoice = await this.repo.create(dalInput);

    if (!invoice) {
      throw new Error(INVOICE_ERROR_MESSAGES.CREATE_FAILED);
    }

    return invoice;
  }

  /**
   * Validates and updates an invoice.
   * @param id - Invoice ID as string.
   * @param formData - FormData from the client.
   * @returns The updated InvoiceDto.
   * @throws {ZodError | Error} On validation or DB error.
   */
  async updateInvoice(id: string, formData: FormData): Promise<InvoiceDto> {
    const validated = CreateInvoiceSchema.safeParse({
      amount: formData.get("amount"),
      customerId: formData.get("customerId"),
      status: formData.get("status"),
    });

    if (!validated.success) {
      throw validated.error;
    }

    const updatedInvoice = await this.repo.update(toInvoiceId(id), {
      amount: Math.round(validated.data.amount * 100),
      customerId: toCustomerId(validated.data.customerId),
      status: toInvoiceStatusBrand(validated.data.status),
    });

    if (!updatedInvoice) {
      throw new Error(INVOICE_ERROR_MESSAGES.UPDATE_FAILED);
    }

    return updatedInvoice;
  }
}
