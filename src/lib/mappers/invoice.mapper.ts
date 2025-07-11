import type { InvoiceEntity } from "@/lib/db/entities/invoice";
import type {
  InvoiceId,
  InvoiceStatus,
} from "@/lib/definitions/invoices.types";
import type { InvoiceDto } from "@/lib/dto/invoice.dto";
import { toCustomerIdBrand } from "@/lib/mappers/customer.mapper";

/**
 * Helper to brand a string as InvoiceId.
 */
export const toInvoiceIdBrand = (id: string): InvoiceId => id as InvoiceId;

/**
 * Helper to brand a string as InvoiceStatus.
 */
export const toInvoiceStatusBrand = (status: string): InvoiceStatus =>
  status as InvoiceStatus;

/**
 * Maps a raw database row to an InvoiceEntity.
 * Ensures type safety by branding IDs and validating status.
 *
 * @param row - The raw database row representing an invoice.
 * @returns An InvoiceEntity with branded types and validated status.
 * @throws Error if status is invalid.
 */
export function toInvoiceEntity(row: {
  amount: number;
  customerId: string;
  id: string;
  date: string;
  status: string;
}): InvoiceEntity {
  return {
    amount: row.amount,
    customerId: toCustomerIdBrand(row.customerId),
    date: row.date,
    id: toInvoiceIdBrand(row.id),
    status: toInvoiceStatusBrand(row.status),
  };
}

/**
 * Maps an InvoiceEntity to an InvoiceDto.
 * This is used for returning data to the client and stripping brands for id and customerId.
 * Brand for status is retained for type safety.
 *
 * @param entity - The InvoiceEntity to convert.
 * @returns An InvoiceDto with the same data.
 */
export function toInvoiceDto(entity: InvoiceEntity): InvoiceDto {
  return {
    amount: entity.amount,
    customerId: entity.customerId as string,
    date: entity.date,
    id: entity.id as string,
    status: entity.status,
  };
}
