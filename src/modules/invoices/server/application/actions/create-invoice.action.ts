"use server";
import { revalidatePath } from "next/cache";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import { translator } from "@/modules/invoices/domain/i18n/translator";
import {
  type CreateInvoiceFieldNames,
  type CreateInvoiceOutput,
  CreateInvoiceSchema,
} from "@/modules/invoices/domain/schema/invoice.schema";
import { InvoiceService } from "@/modules/invoices/server/application/services/invoice.service";
import { toInvoiceErrorMessage } from "@/modules/invoices/server/application/utils/error-messages";
import { InvoiceRepository } from "@/modules/invoices/server/infrastructure/repository/repository";
import { getAppDb } from "@/server-core/db/db.connection";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server-core/events/invoice/invoice-event.types";
import { deriveFieldNamesFromSchema } from "@/shared/forms/infrastructure/zod/derive-field-names-from-schema";
import { mapZodErrorToDenseFieldErrors } from "@/shared/forms/infrastructure/zod/map-zod-errors-to-field-errors";
import { isZodErrorInstance } from "@/shared/forms/infrastructure/zod/zod-guards";
import type { FormResult } from "@/shared/forms/types/form-result.types";
import {
  formError,
  formOk,
} from "@/shared/forms/utilities/factories/create-form-result.factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";
import { ROUTES } from "@/shared/routes/routes";

const allowed = deriveFieldNamesFromSchema(CreateInvoiceSchema);

const toOptionalString = (v: FormDataEntryValue | null): string | undefined =>
  typeof v === "string" ? v : undefined;

/**
 * Server action for creating a new invoice.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <ignore for now>
export async function createInvoiceAction(
  _prevState: FormResult<CreateInvoiceOutput>,
  formData: FormData,
): Promise<FormResult<CreateInvoiceOutput>> {
  // 1. Parse Input: Extract raw strings so Zod schemas (and codecs) can handle coercion/validation
  const rawInput = {
    amount: toOptionalString(formData.get("amount")),
    customerId: toOptionalString(formData.get("customerId")),
    date: toOptionalString(formData.get("date")),
    sensitiveData: toOptionalString(formData.get("sensitiveData")),
    status: toOptionalString(formData.get("status")),
  };

  const parsed = CreateInvoiceSchema.safeParse(rawInput);

  if (!parsed.success) {
    return formError<CreateInvoiceFieldNames>({
      fieldErrors: mapZodErrorToDenseFieldErrors(parsed.error, allowed),
      message: translator(INVOICE_MSG.validationFailed),
    });
  }

  // 2. Perform Async Operation
  try {
    const repo = new InvoiceRepository(getAppDb());
    const service = new InvoiceService(repo);
    const result = await service.createInvoice(parsed.data);

    if (!result.ok) {
      return formError<CreateInvoiceFieldNames>({
        fieldErrors: {
          amount: [],
          customerId: [],
          date: [],
          sensitiveData: [],
          status: [],
        },
        message: toInvoiceErrorMessage(result.error),
      });
    }

    const invoice = result.value;

    const { EventBus } = await import("@/server-core/events/event-bus");
    await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.created, {
      eventId: crypto.randomUUID(),
      eventTimestamp: new Date().toISOString(),
      invoice,
      operation: "invoice_created",
    });

    // 3. Success: Revalidate but do NOT redirect so the form can show the success message
    revalidatePath(ROUTES.dashboard.invoices);
    return formOk(parsed.data, translator(INVOICE_MSG.createSuccess));
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
