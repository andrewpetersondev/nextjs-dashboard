"use server";

import {
  INVOICE_ERROR_MESSAGES,
  INVOICE_SUCCESS_MESSAGES,
} from "@/features/invoices/messages";
import { getDB } from "@/server/db/connection";
import { assertParams } from "@/server/invoices/helpers";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import type { InvoiceActionResult } from "@/server/invoices/types";
import { serverLogger } from "@/server/logging/serverLogger";
import { ValidationError } from "@/shared/errors/domain";
import type { InvoiceDto } from "@/shared/invoices/dto";

/**
 * Server action to fetch a single invoice by its ID.
 * @param id - The invoice ID (string)
 * @returns An InvoiceActionResult with data, errors, message, and success
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
          message: INVOICE_ERROR_MESSAGES.INVALID_ID,
          validate: (v) => v.trim().length > 0,
        },
      },
    );

    // Dependency injection: pass repository to service
    const repo = new InvoiceRepository(getDB());
    // Create service instance with injected repository
    const service = new InvoiceService(repo);
    // Call service and get invoice
    const invoice: InvoiceDto = await service.readInvoice(id);

    // Success result with invoice data
    result = {
      data: invoice,
      errors: {},
      message: INVOICE_SUCCESS_MESSAGES.READ_SUCCESS,
      success: true,
    };
  } catch (error) {
    serverLogger.error({
      context: "readInvoiceAction",
      error,
      id,
    });

    // Error response shaped as InvoiceActionResult
    result = {
      errors: {},
      message:
        error instanceof ValidationError
          ? INVOICE_ERROR_MESSAGES.INVALID_INPUT
          : INVOICE_ERROR_MESSAGES.SERVICE_ERROR,
      success: false,
    };
  }

  return result;
}
