"use server";
import type { InvoiceDto } from "@/features/invoices/lib/dto";
import { getAppDb } from "@/server/db/db.connection";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import { AppError } from "@/shared/errors/core/app-error.class";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";

export async function readInvoiceByIdAction(id: string): Promise<InvoiceDto> {
  try {
    if (!id) {
      throw new AppError("validation", {
        context: { id },
        message: INVOICE_MSG.invalidId,
      });
    }
    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getAppDb());
    // Create service instance with injected repository
    const service = new InvoiceService(repo);
    // Call service with validated DTO to retrieve complete InvoiceDto
    const invoice: InvoiceDto = await service.readInvoice(id);
    if (!invoice) {
      throw new AppError("notFound", {
        message: `Invoice with ID ${id} not found`,
      });
    }
    return invoice;
  } catch (error) {
    throw new AppError("database", {
      context: { error },
      message: INVOICE_MSG.dbError,
    });
  }
}
