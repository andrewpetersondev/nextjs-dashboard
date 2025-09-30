"use server";

import { revalidatePath } from "next/cache";
import type { InvoiceDto, InvoiceFormDto } from "@/features/invoices/lib/dto";
import {
  type CreateInvoiceFieldNames,
  type CreateInvoiceOutput,
  CreateInvoiceSchema,
} from "@/features/invoices/lib/invoice.schema";
import type { InvoiceStatus } from "@/features/invoices/lib/types";
import { getDB } from "@/server/db/connection";
import { toInvoiceErrorMessage } from "@/server/errors/to-invoice-error-message";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import { serverLogger } from "@/server/logging/serverLogger";
import {
  isZodErrorInstance,
  mapZodErrorToDenseFieldErrors,
} from "@/shared/forms/errors/zod-error-mapping";
import { deriveSchemaFieldNames } from "@/shared/forms/fields/field-name-resolution";
import type { FormState } from "@/shared/forms/types/form-state.type";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";
import { translator } from "@/shared/i18n/translator";
import { ROUTES } from "@/shared/routes/routes";

const allowed = deriveSchemaFieldNames(CreateInvoiceSchema);

/**
 * Server action for creating a new invoice.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
export async function createInvoiceAction(
  prevState: FormState<CreateInvoiceFieldNames, CreateInvoiceOutput>,
  formData: FormData,
): Promise<FormState<CreateInvoiceFieldNames, CreateInvoiceOutput>> {
  let result: FormState<CreateInvoiceFieldNames, CreateInvoiceOutput>;

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
        errors: mapZodErrorToDenseFieldErrors(parsed.error, allowed),
        message: translator(INVOICE_MSG.VALIDATION_FAILED),
        success: false,
      };
    }
  } catch (error) {
    // Decide the top-level user-facing message based on error type
    const baseMessage = isZodErrorInstance(error)
      ? translator(INVOICE_MSG.VALIDATION_FAILED)
      : toInvoiceErrorMessage(error);

    serverLogger.error({
      context: "createInvoiceAction",
      error,
      message: baseMessage,
    });

    result = {
      ...prevState,
      // Ensure errors always match the dense map type expected by FormState
      errors: isZodErrorInstance(error)
        ? mapZodErrorToDenseFieldErrors(error, allowed)
        : ({} as Readonly<Record<CreateInvoiceFieldNames, readonly string[]>>),
      message: baseMessage,
      success: false,
    };
  }
  return result;
}
