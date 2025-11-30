"use server";
import { revalidatePath } from "next/cache";
import type { InvoiceDto, InvoiceFormDto } from "@/features/invoices/lib/dto";
import {
  type CreateInvoiceFieldNames,
  type CreateInvoiceOutput,
  CreateInvoiceSchema,
} from "@/features/invoices/lib/invoice.schema";
import type { InvoiceStatus } from "@/features/invoices/lib/types";
import { getAppDb } from "@/server/db/db.connection";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import { InvoiceRepository } from "@/server/invoices/repo";
import { InvoiceService } from "@/server/invoices/service";
import { toInvoiceErrorMessage } from "@/server/invoices/to-invoice-error-message";
import {
  formError,
  formOk,
} from "@/shared/forms/domain/factories/form-result.factory";
import type { FormResult } from "@/shared/forms/domain/types/form-result.types";
import { mapZodErrorToDenseFieldErrors } from "@/shared/forms/infrastructure/zod/zod-error.mapper";
import { deriveFieldNamesFromSchema } from "@/shared/forms/infrastructure/zod/zod-field-names.derive";
import { isZodErrorInstance } from "@/shared/forms/infrastructure/zod/zod-guards";
import { INVOICE_MSG } from "@/shared/i18n/messages/invoice-messages";
import { translator } from "@/shared/i18n/translator";
import { logger } from "@/shared/logging/infra/logging.client";
import { ROUTES } from "@/shared/routes/routes";

const allowed = deriveFieldNamesFromSchema(CreateInvoiceSchema);

/**
 * Server action for creating a new invoice.
 */
export async function createInvoiceAction(
  _prevState: FormResult<CreateInvoiceOutput>,
  formData: FormData,
): Promise<FormResult<CreateInvoiceOutput>> {
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
      const repo = new InvoiceRepository(getAppDb());
      const service = new InvoiceService(repo);
      const invoice: InvoiceDto = await service.createInvoice(parsed.data);

      const { EventBus } = await import("@/server/events/event-bus");
      await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.created, {
        eventId: crypto.randomUUID(),
        eventTimestamp: new Date().toISOString(),
        invoice,
        operation: "invoice_created",
      });

      revalidatePath(ROUTES.dashboard.root);

      return formOk(parsed.data, translator(INVOICE_MSG.createSuccess));
    }

    return formError<CreateInvoiceFieldNames>({
      fieldErrors: mapZodErrorToDenseFieldErrors(parsed.error, allowed),
      message: translator(INVOICE_MSG.validationFailed),
    });
  } catch (error) {
    // Decide the top-level user-facing message based on error type
    const baseMessage = isZodErrorInstance(error)
      ? translator(INVOICE_MSG.validationFailed)
      : toInvoiceErrorMessage(error);

    logger.error(baseMessage, {
      context: "createInvoiceAction",
      error,
      message: baseMessage,
    });

    return formError<CreateInvoiceFieldNames>({
      fieldErrors: isZodErrorInstance(error)
        ? mapZodErrorToDenseFieldErrors(error, allowed)
        : ({} as Readonly<Record<CreateInvoiceFieldNames, readonly string[]>>),
      message: baseMessage,
    });
  }
}
