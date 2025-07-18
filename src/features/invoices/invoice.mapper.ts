import "server-only";

import type { InvoiceEntity } from "@/db/models/invoice.entity";
import type { InvoiceRawDrizzle } from "@/db/schema";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import {
  INVOICE_STATUSES,
  type UiInvoiceInput,
} from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import {
  toCustomerId,
  toInvoiceId,
  toInvoiceStatusBrand,
} from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";

/**
 * Transforms a raw database row (from Drizzle ORM) into a strongly-typed `InvoiceEntity`.
 *
 * - Enforces domain invariants and applies defensive branding.
 * - Validates primitive types at runtime; branding is compile-time only.
 * - Throws if required fields are missing or invalid.
 *
 * @param row - Raw invoice row from the database.
 * @returns InvoiceEntity with branded types.
 * @throws Error if required fields are missing or invalid.
 */
export function toInvoiceEntity(row: InvoiceRawDrizzle): InvoiceEntity {
  if (
    !row ||
    typeof row.customerId !== "string" ||
    typeof row.id !== "string"
  ) {
    logger.error({
      context: "toInvoiceEntity",
      expectedFields: [
        "amount (number)",
        "customerId (string)",
        "id (string)",
        "date (string)",
        "sensitiveData (string)",
        "status (string)",
      ],
      message: "Invalid invoice row",
      row,
    });
    throw new Error("Invalid invoice row: missing required fields");
  }
  return {
    amount: row.amount,
    customerId: toCustomerId(row.customerId),
    date: row.date,
    id: toInvoiceId(row.id),
    sensitiveData: row.sensitiveData,
    status: toInvoiceStatusBrand(row.status),
  };
}

/**
 * Maps an `InvoiceEntity` to an `InvoiceDto` for transport to the client/UI.
 *
 * - Strips branded types to plain types for serialization.
 * - Use this function when sending invoice data to external consumers.
 * - Defensively converts all properties to plain types.
 *
 * @param entity - The domain entity to convert.
 * @returns InvoiceDto with plain types.
 */
export function toInvoiceDto(entity: InvoiceEntity): InvoiceDto {
  return {
    amount: Number(entity.amount),
    customerId: String(entity.customerId),
    date: String(entity.date),
    id: String(entity.id),
    status: toInvoiceStatusBrand(entity.status),
  };
}

/**
 * Maps and transforms UI invoice form input to a DTO shape for server logic.
 *
 * - Converts amount to cents (integer).
 * - Adds current date in YYYY-MM-DD format.
 * - Validates input strictly.
 *
 * @param uiInput - UI invoice form input.
 * @returns InvoiceDto shape (without id).
 * @throws Error if input is invalid or branding fails.
 */
export function transformUiInvoiceFields(
  uiInput: UiInvoiceInput,
): Omit<InvoiceDto, "id"> {
  const { amount, customerId, status } = uiInput;

  if (Number.isNaN(amount) || amount < 0) {
    logger.error({
      amount,
      context: "transformUiInvoiceFields",
      message: "Invalid amount: must be a non-negative number.",
    });
    throw new Error("Invalid amount: must be a non-negative number.");
  }

  if (!customerId.trim()) {
    logger.error({
      context: "transformUiInvoiceFields",
      customerId,
      message: "Invalid customerId: must be a non-empty string.",
    });
    throw new Error("Invalid customerId: must be a non-empty string.");
  }

  if (!INVOICE_STATUSES.includes(status)) {
    logger.error({
      context: "transformUiInvoiceFields",
      message: `Invalid status: must be one of ${INVOICE_STATUSES.join(", ")}.`,
      status,
    });
    throw new Error(
      `Invalid status: must be one of ${INVOICE_STATUSES.join(", ")}.`,
    );
  }

  const amountInCents = Math.round(amount * 100);
  const date = new Date().toISOString().split("T")[0] as string;

  const fields = { amount: amountInCents, customerId, date, status };

  if (!fields) {
    logger.error({
      context: "transformUiInvoiceFields",
      expectedFields: [
        "amount (number)",
        "customerId (string)",
        "date (string)",
        "status (string)",
      ],
      fields,
      message: INVOICE_ERROR_MESSAGES.TRANSFORMATION_FAILED,
    });
    throw new Error(INVOICE_ERROR_MESSAGES.TRANSFORMATION_FAILED);
  }

  return fields;
}
