"use server";

import { InvoiceService } from "@/modules/invoices/application/services/invoice.service";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import type { InvoiceDto } from "@/modules/invoices/domain/invoice.dto";
import { InvoiceRepository } from "@/modules/invoices/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

export async function readInvoiceByIdAction(id: string): Promise<InvoiceDto> {
  try {
    if (!id) {
      throw makeAppError("validation", {
        cause: "",
        message: INVOICE_MSG.invalidId,
        metadata: {},
      });
    }
    const repo = new InvoiceRepository(getAppDb());
    const service = new InvoiceService(repo);
    const result = await service.readInvoice(id);
    if (!result.ok) {
      throw makeAppError(result.error.key, {
        cause: "",
        message: result.error.message,
        metadata: result.error.metadata,
      });
    }
    return result.value;
  } catch (error) {
    throw makeAppError("database", {
      cause: Error.isError(error) ? error : "fix this later",
      message: INVOICE_MSG.dbError,
      metadata: {},
    });
  }
}
