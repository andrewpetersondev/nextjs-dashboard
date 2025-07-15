import type { InvoiceEntity } from "@/db/models/invoice.entity";
import type { InvoiceRawDrizzle } from "@/db/schema";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
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
    typeof row.amount !== "number" ||
    typeof row.customerId !== "string" ||
    typeof row.id !== "string" ||
    typeof row.date !== "string" ||
    typeof row.sensitiveData !== "string" ||
    typeof row.status !== "string"
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

// Maps an InvoiceDto (from client) to an InvoiceEntity.
// export function fromInvoiceDto(dto: UserDto): InvoiceEntity {
// ...validate, sanitize, brand
// }

// Maps an InvoiceEntity to a DB model for persistence.
// export function toInvoiceDbModel(entity: InvoiceEntity): InvoiceRawDrizzle {
// ...prepare for Drizzle ORM
// }
