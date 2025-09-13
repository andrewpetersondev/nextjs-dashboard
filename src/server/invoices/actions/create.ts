"use server";

import { revalidatePath } from "next/cache";
import type { InvoiceDto, InvoiceFormDto } from "@/features/invoices/dto/dto";
import type { InvoiceStatus } from "@/features/invoices/dto/types";
import {
  type CreateInvoiceFieldNames,
  type CreateInvoiceInput,
  CreateInvoiceSchema,
} from "@/features/invoices/schema/shared";
import { getDB } from "@/server/db/connection";
import { toInvoiceErrorMessage } from "@/server/errors/to-invoice-error-message";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import { serverLogger } from "@/server/logging/serverLogger";
import { mapFieldErrors } from "@/shared/forms/errors";
import { isZodError } from "@/shared/forms/form-guards";
import { deriveAllowedFieldsFromSchema } from "@/shared/forms/schema";
import type { FormState } from "@/shared/forms/types";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";
import { translator } from "@/shared/i18n/translator";
import { ROUTES } from "@/shared/routes/routes";

const allowed = deriveAllowedFieldsFromSchema(CreateInvoiceSchema);

/**
 * Server action for creating a new invoice.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
export async function createInvoiceAction(
  prevState: FormState<CreateInvoiceFieldNames, CreateInvoiceInput>,
  formData: FormData,
): Promise<FormState<CreateInvoiceFieldNames, CreateInvoiceInput>> {
  let result: FormState<CreateInvoiceFieldNames, CreateInvoiceInput>;

  try {
    const input: InvoiceFormDto = {
      amount: Number(formData.get("amount")),
      customerId: String(formData.get("customerId")),
      date: String(formData.get("date")),
      sensitiveData: String(formData.get("sensitiveData")),
      status: String(formData.get("status")) as InvoiceStatus,
    };

    const parsed = CreateInvoiceSchema.safeParse(input);

    if (parsed.success) {
      const repo = new InvoiceRepository(getDB());
      const service = new InvoiceService(repo);
      const invoice: InvoiceDto = await service.createInvoice(parsed.data);

      const { EventBus } = await import("@/server/events/event-bus");
      await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.CREATED, {
        eventId: crypto.randomUUID(),
        eventTimestamp: new Date().toISOString(),
        invoice,
        operation: "invoice_created",
      });

      revalidatePath(ROUTES.DASHBOARD.ROOT);

      result = {
        data: parsed.data,
        message: translator(INVOICE_MSG.CREATE_SUCCESS),
        success: true,
      };
    } else {
      result = {
        ...prevState,
        errors: mapFieldErrors(parsed.error.flatten().fieldErrors, allowed),
        message: translator(INVOICE_MSG.VALIDATION_FAILED),
        success: false,
      };
    }
  } catch (error) {
    // Decide the top-level user-facing message based on error type
    const baseMessage = isZodError(error)
      ? translator(INVOICE_MSG.VALIDATION_FAILED)
      : toInvoiceErrorMessage(error);

    serverLogger.error({
      context: "createInvoiceAction",
      error,
      message: baseMessage,
    });

    result = {
      ...prevState,
      errors: isZodError(error)
        ? mapFieldErrors(error.flatten().fieldErrors, allowed)
        : {},
      message: baseMessage,
      success: false,
    };
  }
  return result;
}
