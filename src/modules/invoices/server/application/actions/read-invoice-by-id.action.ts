"use server";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceDto } from "@/modules/invoices/domain/invoice.dto";
import { InvoiceService } from "@/modules/invoices/server/application/services/invoice.service";
import { InvoiceRepository } from "@/modules/invoices/server/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";
import { AppError } from "@/shared/errors/core/app-error.class";

export async function readInvoiceByIdAction(id: string): Promise<InvoiceDto> {
  try {
    if (!id) {
      throw new AppError("validation", {
        message: INVOICE_MSG.invalidId,
        metadata: { id },
      });
    }
    const repo = new InvoiceRepository(getAppDb());
    const service = new InvoiceService(repo);
    const result = await service.readInvoice(id);
    if (!result.ok) {
      throw new AppError(result.error.code, {
        message: result.error.message,
        metadata: result.error.metadata,
      });
    }
    return result.value;
  } catch (error) {
    throw new AppError("database", {
      message: INVOICE_MSG.dbError,
      metadata: { error },
    });
  }
}
