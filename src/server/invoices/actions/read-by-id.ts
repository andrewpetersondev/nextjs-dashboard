"use server";

import { INVOICE_ERROR_MESSAGES } from "@/features/invoices/messages";
import { getDB } from "@/server/db/connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import { ValidationError } from "@/shared/errors/domain";
import type { InvoiceDto } from "@/shared/invoices/dto";

export async function readInvoiceByIdAction(id: string): Promise<InvoiceDto> {
  try {
    if (!id) {
      throw new ValidationError(INVOICE_ERROR_MESSAGES.INVALID_ID, { id });
    }
    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getDB());
    // Create service instance with injected repository
    const service = new InvoiceService(repo);
    // Call service with validated DTO to retrieve complete InvoiceDto
    const invoice: InvoiceDto = await service.readInvoice(id);
    if (!invoice) {
      throw new Error(`Invoice with ID ${id} not found`);
    }
    return invoice;
  } catch (error) {
    throw new DatabaseError(
      INVOICE_ERROR_MESSAGES.DB_ERROR,
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
