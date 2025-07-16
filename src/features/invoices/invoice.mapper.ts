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
 * @param row - Raw invoice row from the database (may be branded by Drizzle).
 * @returns {InvoiceEntity} - The domain entity with enforced invariants and branding.
 * @throws {Error} - If required fields are missing or invalid.
 *
 * @example
 * const entity = toInvoiceEntity(dbRow);
 */
export function toInvoiceEntity(row: InvoiceRawDrizzle): InvoiceEntity {
  // Defensive: Validate all required fields
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
  // Defensive: Apply branding even though the properties are already branded in the DB schema
  return {
    amount: row.amount,
    customerId: toCustomerId(row.customerId), // Defensive
    date: row.date,
    id: toInvoiceId(row.id), // Defensive
    sensitiveData: row.sensitiveData, // Sensitive data should not be exposed in DTOs
    status: toInvoiceStatusBrand(row.status), // Defensive
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
 * @returns {InvoiceDto} - The DTO with plain types.
 *
 * @example
 * const dto = toInvoiceDto(entity);
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
 * Maps and transforms UI invoice form input to a proper types for server logic.
 * - Converts amount to cents (integer).
 * - Adds current date in YYYY-MM-DD format.
 * - Validates input strictly.
 *
 * @param uiInput - UI invoice form input.
 * @returns Branded invoice fields for DAL/DTO.
 * @throws Error if input is invalid or branding fails.
 */
export function transformUiInvoiceFields(
  uiInput: UiInvoiceInput,
): Omit<InvoiceDto, "id"> {
  const { amount, customerId, status } = uiInput;

  // Validate amount
  if (Number.isNaN(amount) || amount < 0) {
    logger.error({
      amount,
      context: "mapUiInvoiceInputToBrandedDto",
      message: "Invalid amount: must be a non-negative number.",
    });
    throw new Error("Invalid amount: must be a non-negative number.");
  }

  // Validate customerId
  if (!customerId.trim()) {
    logger.error({
      context: "mapUiInvoiceInputToBrandedDto",
      customerId,
      message: "Invalid customerId: must be a non-empty string.",
    });
    throw new Error("Invalid customerId: must be a non-empty string.");
  }

  // Validate status
  if (!INVOICE_STATUSES.includes(status)) {
    logger.error({
      context: "mapUiInvoiceInputToBrandedDto",
      message: `Invalid status: must be one of ${INVOICE_STATUSES.join(", ")}.`,
      status,
    });
    throw new Error(
      `Invalid status: must be one of ${INVOICE_STATUSES.join(", ")}.`,
    );
  }

  const amountInCents = Math.round(amount * 100); // Convert dollars to cents
  const date = new Date().toISOString().split("T")[0] as string; // YYYY-MM-DD

  const fields = { amount: amountInCents, customerId, date, status };

  // Defensive: Validate fields before returning
  if (
    !fields ||
    typeof fields.amount !== "number" ||
    typeof fields.customerId !== "string" ||
    typeof fields.date !== "string" ||
    typeof fields.status !== "string"
  ) {
    logger.error({
      context: "mapUiInvoiceInputToBrandedDto",
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
