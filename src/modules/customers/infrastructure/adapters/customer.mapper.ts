import "server-only";

import type {
  CustomerAggregatesRowRaw,
  CustomerAggregatesServerDto,
  CustomerSelectRowRaw,
  CustomerSelectServerDto,
} from "@/modules/customers/domain/types";
import { toCustomerId } from "@/shared/branding/converters/id-converters";

/**
 * Maps a raw "select" projection row to a server DTO with branded ID.
 */
export function mapCustomerSelectRawToDto(
  row: CustomerSelectRowRaw,
): CustomerSelectServerDto {
  return {
    id: toCustomerId(row.id),
    name: row.name,
  };
}

/**
 * Maps a raw aggregated projection row to a normalized server DTO with branded ID.
 * - Normalizes nullable sums to 0.
 */
export function mapCustomerAggregatesRawToDto(
  row: CustomerAggregatesRowRaw,
): CustomerAggregatesServerDto {
  return {
    email: row.email,
    id: toCustomerId(row.id),
    imageUrl: row.imageUrl,
    name: row.name,
    totalInvoices: row.totalInvoices ?? 0,
    totalPaid: row.totalPaid ?? 0,
    totalPending: row.totalPending ?? 0,
  };
}
