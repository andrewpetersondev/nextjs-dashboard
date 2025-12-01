"use server";
import type { InvoiceDto } from "@/features/invoices/lib/dto";
import { getAppDb } from "@/server/db/db.connection";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import { AppError } from "@/shared/errors/core/app-error.class";
import { INVOICE_MSG } from "@/shared/i18n/invoice-messages";

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
