"use server";

import type { InvoiceDto } from "@/features/invoices/lib/dto";
import { getAppDb } from "@/server/db/db.connection";
import { DatabaseError } from "@/server/errors/infrastructure";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import { ValidationError } from "@/shared/core/errors/domain-error";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";

export async function readInvoiceByIdAction(id: string): Promise<InvoiceDto> {
  try {
    if (!id) {
      throw new ValidationError(INVOICE_MSG.INVALID_ID, { id });
    }
    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getAppDb());
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
      INVOICE_MSG.DB_ERROR,
      {},
      error instanceof Error ? error : undefined,
    );
  }
}
