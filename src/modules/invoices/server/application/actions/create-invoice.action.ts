"use server";

import { revalidatePath } from "next/cache";
import { INVOICE_MSG } from "@/modules/invoices/domain/i18n/invoice-messages";
import { translator } from "@/modules/invoices/domain/i18n/translator";
import {
  type CreateInvoiceFieldNames,
  type CreateInvoicePayload,
  CreateInvoiceSchema,
} from "@/modules/invoices/domain/schema/invoice.schema";
import { InvoiceService } from "@/modules/invoices/server/application/services/invoice.service";
import { toInvoiceErrorMessage } from "@/modules/invoices/server/application/utils/error-messages";
import { InvoiceRepository } from "@/modules/invoices/server/infrastructure/repository/invoice.repository";
import { getAppDb } from "@/server/db/db.connection";
import {
  type BaseInvoiceEvent,
  INVOICE_EVENTS,
} from "@/server/events/invoice/invoice-event.types";
import { resolveRawFieldPayload } from "@/shared/forms/adapters/form-data.adapter";
import { toDenseFieldErrorMapFromZod } from "@/shared/forms/adapters/zod-error.adapter";
import { isZodErrorInstance } from "@/shared/forms/core/guards/zod.guard";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import {
  makeFormError,
  makeFormOk,
} from "@/shared/forms/logic/factories/form-result.factory";
import { extractSchemaFieldNames } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { logger } from "@/shared/logging/infrastructure/logging.client";
import { ROUTES } from "@/shared/routes/routes";

const allowed = extractSchemaFieldNames(CreateInvoiceSchema);

/**
 * Server action for creating a new invoice.
 */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <ignore for now>
export async function createInvoiceAction(
  _prevState: FormResult<CreateInvoicePayload>,
  formData: FormData,
): Promise<FormResult<CreateInvoicePayload>> {
  // 1. Parse Input: Leverage infrastructure for consistent extraction
  const rawInput = resolveRawFieldPayload(formData, allowed);
  const parsed = CreateInvoiceSchema.safeParse(rawInput);

  if (!parsed.success) {
    return makeFormError<CreateInvoiceFieldNames>({
      fieldErrors: toDenseFieldErrorMapFromZod(parsed.error, allowed),
      message: translator(INVOICE_MSG.validationFailed),
    });
  }

  // 2. Perform Async Operation
  try {
    const repo = new InvoiceRepository(getAppDb());
    const service = new InvoiceService(repo);
    const result = await service.createInvoice(parsed.data);

    if (!result.ok) {
      return makeFormError<CreateInvoiceFieldNames>({
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

    const { EventBus } = await import("@/server/events/event-bus");
    await EventBus.publish<BaseInvoiceEvent>(INVOICE_EVENTS.created, {
      eventId: crypto.randomUUID(),
      eventTimestamp: new Date().toISOString(),
      invoice,
      operation: "invoice_created",
    });

    // 3. Success: Revalidate but do NOT redirect so the form can show the success message
    revalidatePath(ROUTES.dashboard.invoices);
    return makeFormOk(parsed.data, translator(INVOICE_MSG.createSuccess));
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

    return makeFormError<CreateInvoiceFieldNames>({
      fieldErrors: isZodErrorInstance(error)
        ? toDenseFieldErrorMapFromZod(error, allowed)
        : ({} as Readonly<Record<CreateInvoiceFieldNames, readonly string[]>>),
      message: baseMessage,
    });
  }
}
