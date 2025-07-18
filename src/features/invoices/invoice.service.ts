// src/features/invoices/invoice.service.ts

import { getDB } from "@/db/connection";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { toCustomerId, toInvoiceStatusBrand } from "@/lib/definitions/brands";
import { createInvoiceDal } from "./invoice.dal";
import type { InvoiceDto } from "./invoice.dto";
import { CreateInvoiceSchema } from "./invoice.types";

/**
 * Service for invoice business logic.
 */
export class InvoiceService {
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

    const invoice = await createInvoiceDal(getDB(), {
      amount: Math.round(validated.data.amount * 100),
      customerId: toCustomerId(validated.data.customerId),
      date: new Date().toISOString(),
      status: toInvoiceStatusBrand(validated.data.status),
    });

    if (!invoice) {
      throw new Error(INVOICE_ERROR_MESSAGES.CREATE_FAILED);
    }

    return invoice;
  }
}
