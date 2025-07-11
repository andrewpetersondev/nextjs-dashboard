import type { InvoiceEntity } from "@/lib/db/entities/invoice";
import {
  toCustomerId,
  toInvoiceId,
  toInvoiceStatusBrand,
} from "@/lib/definitions/brands";
import type { InvoiceDto } from "@/lib/dto/invoice.dto";

/**
 * Maps a raw DB row to an InvoiceEntity with branded types.
 * Throws if status is invalid.
 */
export function toInvoiceEntity(row: {
  amount: number;
  customerId: string;
  id: string;
  date: string;
  status: string;
}): InvoiceEntity {
  // Defensive: Validate all required fields
  if (
    !row ||
    typeof row.amount !== "number" ||
    !row.customerId ||
    !row.id ||
    !row.date ||
    !row.status
  ) {
    throw new Error("Invalid invoice row: missing required fields");
  }
  return {
    amount: row.amount,
    customerId: toCustomerId(row.customerId),
    date: row.date,
    id: toInvoiceId(row.id),
    status: toInvoiceStatusBrand(row.status),
  };
}

/**
 * Maps an InvoiceEntity to an InvoiceDto for client use.
 * Branded IDs are converted to string.
 */
export function toInvoiceDto(entity: InvoiceEntity): InvoiceDto {
  return {
    amount: entity.amount,
    customerId: entity.customerId as string, // Explicitly document brand stripping
    date: entity.date,
    id: entity.id as string,
    status: entity.status,
  };
}
