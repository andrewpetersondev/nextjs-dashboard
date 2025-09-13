"use server";

import { revalidatePath } from "next/cache";
import { getDB } from "@/server/db/connection";
import { toInvoiceErrorMessage } from "@/server/errors/to-invoice-error-message";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import { serverLogger } from "@/server/logging/serverLogger";
import { ROUTES } from "@/shared/constants/routes";
import { isZodError } from "@/shared/forms/guards";
import type { FormState } from "@/shared/forms/types";
import { translator } from "@/shared/i18n/translator";
import type { InvoiceDto, InvoiceFormDto } from "@/shared/invoices/dto";
import type { InvoiceStatus } from "@/shared/invoices/dto/types";
import { INVOICE_MSG } from "@/shared/invoices/messages";
import {
  type CreateInvoiceFieldNames,
  type CreateInvoiceInput,
  CreateInvoiceSchema,
} from "@/shared/invoices/schema/shared";
import {
  deriveAllowedFieldsFromSchema,
  mapFieldErrors,
} from "@/shared/utils/utils";

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
