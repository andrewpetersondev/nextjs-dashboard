"use server";

import type { InvoiceDto } from "@/features/invoices/dto/dto";
import { getDB } from "@/server/db/connection";
import { toInvoiceErrorMessage } from "@/server/errors/to-invoice-error-message";
import { assertParams } from "@/server/invoices/helpers";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import type { InvoiceActionResult } from "@/server/invoices/types";
import { serverLogger } from "@/server/logging/serverLogger";
import { translator } from "@/shared/i18n/translator";
import { INVOICE_MSG } from "@/shared/messages";

/**
 * Server action to fetch a single invoice by its ID.
 */
export async function readInvoiceAction(
  id: string,
): Promise<InvoiceActionResult> {
  let result: InvoiceActionResult;

  try {
    // Validate parameters using generic assertParams
    assertParams(
      { id },
      {
        id: {
          message: INVOICE_MSG.INVALID_ID,
          validate: (v) => v.trim().length > 0,
        },
      },
    );

    const repo = new InvoiceRepository(getDB());
    const service = new InvoiceService(repo);
    const invoice: InvoiceDto = await service.readInvoice(id);

    // Success result with invoice data
    result = {
      data: invoice,
      errors: {},
      message: translator(INVOICE_MSG.READ_SUCCESS),
      success: true,
    };
  } catch (error) {
    const message = toInvoiceErrorMessage(error);

    serverLogger.error({
      context: "readInvoiceAction",
      error,
      id,
      message,
    });

    result = {
      errors: {},
      message,
      success: false,
    };
  }

  return result;
}
