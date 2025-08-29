"use server";

import { getDB } from "@/server/db/connection";
import { toInvoiceErrorMessage } from "@/server/errors/to-invoice-error-message";
import { assertParams } from "@/server/invoices/helpers";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import type { InvoiceActionResult } from "@/server/invoices/types";
import { serverLogger } from "@/server/logging/serverLogger";
import type { InvoiceDto } from "@/shared/invoices/dto";
import { INVOICE_MSG } from "@/shared/invoices/messages";

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
      message: INVOICE_MSG.READ_SUCCESS,
      success: true,
    };
  } catch (error) {
    const messageKey = toInvoiceErrorMessage(error);

    serverLogger.error({
      context: "readInvoiceAction",
      error,
      id,
      message: messageKey,
    });

    result = {
      errors: {},
      message: messageKey,
      success: false,
    };
  }

  return result;
}
