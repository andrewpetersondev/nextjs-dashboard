import "server-only";

import type { InvoiceEntity } from "@/db/models/invoice.entity";
import type { InvoiceRawDrizzle } from "@/db/schema";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import {
  INVOICE_STATUSES,
  type InvoiceCreateInput,
  type UiInvoiceInput,
} from "@/features/invoices/invoice.types";
import { INVOICE_ERROR_MESSAGES } from "@/lib/constants/error-messages";
import {
  toCustomerId,
  toInvoiceId,
  toInvoiceStatusBrand,
} from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";
import { getCurrentIsoDate } from "@/lib/utils/utils";

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
export function rawDbToInvoiceEntity(row: InvoiceRawDrizzle): InvoiceEntity {
  if (
    !row ||
    typeof row.customerId !== "string" ||
    typeof row.id !== "string"
  ) {
    logger.error({
      context: "rawDbToInvoiceEntity",
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
export function entityToInvoiceDto(entity: InvoiceEntity): InvoiceDto {
  return {
    amount: Number(entity.amount),
    customerId: String(entity.customerId),
    date: String(entity.date),
    id: String(entity.id),
    status: toInvoiceStatusBrand(entity.status),
  };
}

/**
 * Maps and transforms an `InvoiceDto` to a UI input shape.
 * - Converts amount to a float (dollars).
 * @param dto
 * @returns Dto  shape for UI forms.
 *
 * @remarks
 * Ready to be extended. Now its only purpose is to convert the amount.
 */
export function dtoToInvoiceUi(dto: InvoiceDto): InvoiceDto {
  if (
    !dto ||
    (dto as unknown as Record<string, unknown>)["sensitiveData"] !== undefined
  ) {
    logger.error({
      context: "dtoToInvoiceUi",
      dto,
      message:
        "Invalid InvoiceDto: missing or invalid amount or did not strip property.",
    });
    throw new Error(
      "Invalid InvoiceDto: missing or invalid amount or did not strip property.",
    );
  }
  return {
    ...dto,
    amount: dto.amount / 100, // Convert cents to dollars
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
export function uiToInvoiceDto(input: UiInvoiceInput): Omit<InvoiceDto, "id"> {
  const { amount, customerId, status } = input;

  if (Number.isNaN(amount) || amount < 0) {
    logger.error({
      amount,
      context: "uiToInvoiceDto",
      message: "Invalid amount: must be a non-negative number.",
    });
    throw new Error("Invalid amount: must be a non-negative number.");
  }

  if (!customerId.trim()) {
    logger.error({
      context: "uiToInvoiceDto",
      customerId,
      message: "Invalid customerId: must be a non-empty string.",
    });
    throw new Error("Invalid customerId: must be a non-empty string.");
  }

  if (!INVOICE_STATUSES.includes(status)) {
    logger.error({
      context: "uiToInvoiceDto",
      message: `Invalid status: must be one of ${INVOICE_STATUSES.join(", ")}.`,
      status,
    });
    throw new Error(
      `Invalid status: must be one of ${INVOICE_STATUSES.join(", ")}.`,
    );
  }

  const fields = {
    amount: Math.round(amount * 100),
    customerId,
    date: getCurrentIsoDate(),
    status,
  };

  if (!fields) {
    logger.error({
      context: "uiToInvoiceDto",
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

/**
 * Maps an `InvoiceDto` to an Entity.
 * - Converts amount to cents (integer).
 * - Validates required fields.
 * @param dto - InvoiceDto to convert.
 * @returns InvoiceEntity with branded types.
 * @throws Error if required fields are missing or invalid.
 * @remarks
 * This function is used to convert DTOs received from the client into Entity objects. ID WILL NOT EXIST FOR NEW INVOICES. CREATE AN ALTERNATIVE FOR THAT.
 */
export function dtoToInvoiceEntity(dto: InvoiceDto): InvoiceEntity {
  if (!dto.id) throw new Error("ID required for entity.");

  if (!dto || !dto.id || !dto.customerId) {
    logger.error({
      context: "dtoToInvoiceEntity",
      dto,
      message: "Invalid InvoiceDto: missing required fields.",
    });
    throw new Error("Invalid InvoiceDto: missing required fields.");
  }

  return {
    amount: dto.amount * 100, // Convert dollars to cents
    customerId: toCustomerId(dto.customerId),
    date: dto.date,
    id: toInvoiceId(dto.id),
    sensitiveData: "", // Sensitive data should not be included in DTOs
    status: toInvoiceStatusBrand(dto.status),
  };
}

/**
 * Maps an `InvoiceDto` to a specific create input for the database.
 * - Converts amount to cents (integer).
 * - Strips ID and sensitive data from required fields.
 * @param dto
 * @returns Omit<InvoiceEntity, "id" | "sensitiveData"> - InvoiceEntity without ID and sensitive data.
 * @remarks
 * This function is used to convert DTOs received from the client into a format suitable for creating new invoices in the database. It does not include ID or sensitive data, as those are not required for creation.
 */
export function specificCreateInvoiceMapper(
  dto: InvoiceDto,
): InvoiceCreateInput {
  return {
    amount: dto.amount * 100, // Convert dollars to cents
    customerId: toCustomerId(dto.customerId),
    date: dto.date,
    status: toInvoiceStatusBrand(dto.status),
  };
}
